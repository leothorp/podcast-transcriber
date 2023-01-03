# podcast-transcriber
CLI tool to transcribe podcast audio files (or other arbitrary English audio with multiple speakers). Outputs transcriptions as docx files. Uses the Deepgram API.

## Usage

### Initial Setup
1. Install [Node.js](https://nodejs.org/en/download/) and [git](https://git-scm.com/download) if you don't already have them.
2. Obtain audio files for the podcast (or other speech audio) that you want to transcribe. Put them in a directory on your local machine. If the original source is Spotify, you can use a tool like [TuneFab](https://www.tunefab.com/) to get these files.
3. Clone this repository to your local machine:
```
git clone https://github.com/leothorp/podcast-transcriber.git
```
4. Sign up for a [Deepgram account](https://console.deepgram.com/signup) and obtain an API key. As of 12/29/22, this includes $150 worth of free API credits.
5. Create a file called `.env` at the root of this repo (this file will be gitignored.) Add your Deepgram API key from the previous step to your new `.env` file as follows:
```
DEEPGRAM_API_KEY=insert-api-key-value-here
```
6. run `npm install` inside this project directory.

### Generating Transcriptions
After completing the setup steps above, run the tool on your directory of audio files by running the following command from within this directory:
```
npm start path/to/audio/files/directory
```
This will create a folder in the same parent directory as your audio input folder, with the same name appended with "_transcripts" and a timestamp. The contents will be a `json` dir with the raw Deepgram JSON responses, and a `docs` directory with formatted transcription docx output files.

## Limitations
* Currently this script can only be used on wav, mp3, ogg, or m4a files. mp3 is recommended.
* The formatted docx file will not be styled correctly if opened in Apple Pages. Google Docs works well.

## Output Example

![image](https://user-images.githubusercontent.com/12928449/210316882-97b93605-7b9c-483a-8126-6f0595863e92.png)




