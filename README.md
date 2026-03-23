# Media Toolkit

A minimal, monochrome desktop app for media conversion and YouTube downloading. Built with Svelte + Electron.

## Features

- **Image Conversion** — PNG, JPG, WEBP, BMP, TIFF, GIF, ICO with quality and resize
- **Video Conversion** — MP4, MKV, AVI, MOV, WEBM, FLV with codec, CRF, preset, resolution, FPS
- **Audio Extraction** — Extract to MP3, FLAC, WAV, AAC, OGG, M4A with bitrate/sample rate
- **YouTube Downloader** — Paste link, fetch info, download MP4/WEBM/MP3 up to 4K
- **Batch Queue** — Queue multiple jobs and process sequentially

## Prerequisites

1. **Node.js** v18+: https://nodejs.org
2. **yt-dlp** (for YouTube): https://github.com/yt-dlp/yt-dlp/releases
   - Place `yt-dlp.exe` in `bin/` folder or add to system PATH

FFmpeg is bundled automatically via `ffmpeg-static`.

## Quick Start

```bash
npm install
npm start
```

## Build Windows .exe

```bash
npm run build           # NSIS installer + portable
npm run build:portable  # Portable only
```

Output: `dist/`

## Stack

- **Svelte 4** + **Vite 5** — Frontend
- **Electron 28** — Desktop shell
- **ffmpeg-static** — Media processing
- **yt-dlp** — YouTube downloads



## License

MIT
