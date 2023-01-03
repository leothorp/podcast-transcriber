const { Deepgram } = require("@deepgram/sdk");
const fs = require("fs");
const path = require("path");
const os = require("os");
const mime = require("mime");
const HTMLtoDOCX = require("html-to-docx");

if (!process.env.DEEPGRAM_API_KEY) {
  console.error(
    "No .env file with an entry for DEEPGRAM_API_KEY was found (see the README for setup instructions)."
  );
  process.exit(1);
}

const exec = async () => {
  const acceptedFileExtensions = [".wav", ".mp3", ".ogg", ".m4a"];
  const audioFileDir = process.argv[2];
  const timestampStr = new Date().toISOString().replace(/:/g, "");

  const transcriptionsDir = path.join(
    path.dirname(audioFileDir),
    path.basename(audioFileDir) + `_transcriptions_${timestampStr}`
  );
  console.log(transcriptionsDir);
  const transcriptionJsonDir = path.join(transcriptionsDir, "json");
  const transcriptionDocsDir = path.join(transcriptionsDir, "docs");

  fs.mkdirSync(transcriptionsDir);
  fs.mkdirSync(transcriptionJsonDir);
  fs.mkdirSync(transcriptionDocsDir);
  const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY || "");

  const filesInDir = fs.readdirSync(audioFileDir);

  //run in sequence to avoid any rate limit concerns.
  //TODO(lt): optimize with staggerPromises to get as close to rate limit as possible
  for (let i = 0; i < filesInDir.length; i++) {
    const fileName = filesInDir[i];

    const filePath = path.join(audioFileDir, fileName);
    if (!acceptedFileExtensions.includes(path.extname(filePath))) {
      //ignore all other files
      continue;
    }
    console.log("path", filePath);
    const buffer = fs.readFileSync(filePath);
    const audioSource = {
      buffer,
      // best guess for mimetype if not derivable
      mimetype: mime.getType(filePath) || "audio/mpeg",
    };
    console.log(audioSource);
    const outputFilenamePrefix = fileName.split(".").slice(0, -1).join(".");
    const jsonFileName = outputFilenamePrefix + ".json";
    const jsonPath = path.join(transcriptionJsonDir, jsonFileName);
    const response = await deepgram.transcription.preRecorded(audioSource, {
      punctuate: true,
      paragraphs: true,
      dates: true,
      times: true,
      numbers: false,
      measurements: true,
      smart_format: true,
      diarize: true,
      tier: "enhanced",
    });
    fs.writeFileSync(jsonPath, JSON.stringify(response));

    const docFileName = outputFilenamePrefix + ".docx";

    // @ts-ignore
    // response.results.channels[0].alternatives[0].paragraphs.paragraphs
    //   .map((p) => {
    //     const { speaker, start, sentences } = p;
    //     const startTimeSecs = Math.floor(start);
    //     const secondsPart = `${startTimeSecs % 60}`.padStart(2, "0");
    //     const minsPart = `${Math.floor(startTimeSecs / 60)}`.padStart(2, "0");
    //     const timeStr = `${minsPart}:${secondsPart}`;
    //     const paragraphTranscript = `[${timeStr} Speaker: ${speaker}]${
    //       os.EOL
    //     }${sentences.map((s) => s.text).join(" ")}${os.EOL}${os.EOL}`;
    //     return paragraphTranscript;
    //   })
    //   .forEach((str) =>
    //     fs.appendFileSync(path.join(transcriptionPdfsDir, docFileName), str)
    //   );
    // console.log(`completed transcription for ${filePath}.\n`);
    const bodyHtml =
      // @ts-ignore
      response.results.channels[0].alternatives[0].paragraphs.paragraphs
        .map((p) => {
          const { speaker, start, sentences } = p;
          const startTimeSecs = Math.floor(start);
          const secondsPart = `${startTimeSecs % 60}`.padStart(2, "0");
          const minsPart = `${Math.floor(startTimeSecs / 60)}`.padStart(2, "0");
          const timeStr = `${minsPart}:${secondsPart}`;
          const paragraphHeaderHtml = `<br /><div style="font-weight: bold; font-family: Arial;"><strong>[${timeStr} Speaker: ${speaker}]</strong></div>`;
          const paragraphTranscriptHtml = `${paragraphHeaderHtml}<p style="font-family: Arial; margin: 0;">${sentences
            .map((s) => s.text)
            .join(" ")}</p>`;
          return paragraphTranscriptHtml;
        })
        .reduce((acc, curr) => acc + curr, "");
    //TODO(lt): revert below
    const title = `<h1>${outputFilenamePrefix}</h1>`;
    // const title = "";
    // const htmlString = `<html><body>${title}${bodyHtml}</body></html>`;

    const htmlString = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Transcription</title>
    </head>
    <body>${title}${bodyHtml}</body></html>`;
    // const htmlString = `${title}${bodyHtml}`;
    console.log(htmlString);
    const docxFileBuffer = await HTMLtoDOCX(htmlString, null, {
      font: "Arial",
    });
    fs.writeFileSync(
      path.join(transcriptionDocsDir, docFileName),
      docxFileBuffer
    );
    console.log(`completed transcription for ${filePath}.\n`);
  }
};

exec();

//currently unused. if utterances: true, is set, group an unbroken string of utterances from the same speaker.
const groupUtterances = (response) => {
  response.results.utterances
    //group
    .reduce(
      (acc, curr, idx, arr) => {
        const currUtteranceGroup = acc[acc.length - 1];
        console.log(currUtteranceGroup);
        if (
          idx === 0 ||
          curr.speaker ===
            currUtteranceGroup[currUtteranceGroup.length - 1].speaker
        ) {
          currUtteranceGroup.push(curr);
        } else {
          acc.push([curr]);
        }
        return acc;
        //
      },
      [[]]
    )
    .map((uttGroup) => {
      const speaker = uttGroup[0].speaker;
      const transcript = uttGroup.reduce(
        (acc, curr) => (acc ? `${acc} ${curr.transcript}` : curr.transcript),
        ""
      );
      return { speaker, transcript };
    })
    .map((curr) => {
      console.log("curr", curr);
      const utteranceStr = `[Speaker:${curr.speaker}] ${curr.transcript}`;
      return utteranceStr + os.EOL;
    })
    .forEach((str) =>
      fs.appendFileSync(path.join(transcriptionPdfsDir, jsonFileName), str)
    );
};
