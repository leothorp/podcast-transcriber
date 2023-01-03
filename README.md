# podcast-transcriber
CLI tool to transcribe podcast audio files (or other arbitrary English audio with multiple speakers.) Uses the Deepgram API.

## Usage

### Initial Setup / Prerequisites
* Install [Node.js](https://nodejs.org/en/download/) and [git](https://git-scm.com/download).
* Obtain audio files for the podcast (or other speech audio) that you want to transcribe. Put them in a directory on your local machine. If the original source is Spotify, you can use a tool like [TuneFab](https://www.tunefab.com/) to get these files.
* Clone this repository to your local machine:
```
git clone https://github.com/leothorp/podcast-transcriber.git
```
* Sign up for a [Deepgram account](https://console.deepgram.com/signup) and obtain an API key. As of 12/29/22, this includes $150 worth of free API credits.
* Create a file called `.env` at the root of this repo (this file will be gitignored.)
Add your Deepgram API key to this file as follows:
```
DEEPGRAM_API_KEY=insert-api-key-value-here
```
* run `npm install` inside this project directory.

### Generating Transcriptions
1. After completing the prerequisites above, run the tool on your directory of audio files as follows:
```
npm start path/to/audio/directory
```

## Limitations
* Currently this script can only be used on wav, mp3, ogg, or m4a files. mp3 is recommended.



