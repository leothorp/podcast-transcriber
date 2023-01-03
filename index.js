const { Deepgram } = require("@deepgram/sdk");
const fs = require("fs");
const path = require("path");
const mime = require("mime");

if (!process.env.DEEPGRAM_API_KEY) {
  console.error(
    "No .env file with an entry for DEEPGRAM_API_KEY was found (see the README for setup instructions)."
  );
  process.exit(1);
}
const fileFormats = [".wav", ".mp3", ".ogg", ".m4a"];

const audioFileDir = process.argv[2];
const timestampStr = new Date().toISOString().replace(/:/g, "");
const transcriptionsDir = path.join(
  path.dirname(audioFileDir),
  path.basename(audioFileDir) + `_transcriptions_${timestampStr}`
);
console.log(transcriptionsDir);
const transcriptionJsonDir = path.join(transcriptionsDir, "json");
const transcriptionPdfsDir = path.join(transcriptionsDir, "pdfs");
fs.mkdirSync(transcriptionsDir);
fs.mkdirSync(transcriptionJsonDir);
fs.mkdirSync(transcriptionPdfsDir);
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY || "");

fs.readdirSync(audioFileDir).forEach(async (fileName) => {
  const filePath = path.join(audioFileDir, fileName);
  if (!fileFormats.includes(path.extname(filePath))) {
    //ignore all other files
    return;
  }
  console.log("path", filePath);
  const buffer = fs.readFileSync(filePath);
  const audioSource = {
    buffer,
    // best guess for mimetype if not derivable
    mimetype: mime.getType(filePath) || "audio/mpeg",
  };
  console.log(audioSource);
  const response = await deepgram.transcription.preRecorded(audioSource, {
    punctuate: true,
    paragraphs: true,
    dates: true,
    times: true,
    numbers: true,
    measurements: true,
    smart_format: true,
    diarize: true,
    tier: "enhanced",
    utterances: true,
  });
  const jsonFileName = fileName.split(".").slice(0, -1).join(".") + ".json";
  fs.writeFileSync(
    path.join(transcriptionJsonDir, jsonFileName),
    JSON.stringify(response)
  );
});
