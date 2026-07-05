# Death By Media

A Windows desktop app for media conversion and YouTube downloading. Built with Svelte and Electron.

The interface follows the Windows 11 design language: a translucent acrylic window that blurs whatever is behind it (Windows 11 22H2 or later; solid fallback elsewhere), frosted glass surfaces, and light/dark styling that follows the system theme.

## Features

- **Image conversion** — PNG, JPG, WEBP, BMP, TIFF, GIF, ICO with quality and resize options
- **Video conversion** — MP4, MKV, AVI, MOV, WEBM, FLV with codec, CRF, preset, resolution, and frame rate control
- **Hardware-accelerated encoding** — NVIDIA NVENC, Intel QuickSync, and AMD AMF for H.264/H.265 (I HAVE NO CLUE IF INTEL AND AMD WORK I CANT TEST IT). Available encoders are detected at startup and the fastest one is selected by default; software (x264/x265) remains available
- **Audio extraction** — MP3, FLAC, WAV, AAC, OGG, M4A with bitrate and sample rate options
- **YouTube downloader** — paste a link, fetch info, download video or audio up to 4K
- **Batch queue** — queue jobs from any tab and process them sequentially
- **Light / dark theme** — automatically follows the Windows system theme

## Requirements

1. **Node.js** v18 or later: https://nodejs.org
2. **yt-dlp** (YouTube downloads only): https://github.com/yt-dlp/yt-dlp/releases
   - Place `yt-dlp.exe` in the `bin/` folder or add it to PATH

FFmpeg is bundled automatically via `ffmpeg-static`. The repository intentionally tracks no binaries or build output — a fresh clone only needs `npm install` plus the optional `yt-dlp.exe`.

## Development

```bash
npm install
npm start        # build renderer and launch the app
npm run dev      # Vite dev server for renderer-only work
```

## Building the installer

```bash
npm run build            # NSIS installer + portable exe
npm run build:portable   # portable exe only
```

Output goes to `dist/` as `DeathByMedia-Setup-<version>.exe` and `DeathByMedia-Portable-<version>.exe`.

**Note:** electron-builder extracts code-signing tools that contain symbolic links. If the build fails with `Cannot create symbolic link`, enable Windows Developer Mode, or extract `winCodeSign-2.6.0.7z` manually into `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0` (the two failing `darwin` entries are safe to skip).

## Stack

- **Svelte 4** + **Vite 5** — frontend
- **Electron 28** — desktop shell
- **ffmpeg-static** — media processing
- **yt-dlp** — YouTube downloads

## License

MIT
