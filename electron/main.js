const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execFile } = require('child_process');

// ─── Paths ───────────────────────────────────────────────────────────
function getResourcePath(subpath) {
  if (app.isPackaged) return path.join(process.resourcesPath, subpath);
  return path.join(__dirname, '..', subpath);
}

function asarUnpack(p) {
  if (p && p.includes('app.asar')) return p.replace('app.asar', 'app.asar.unpacked');
  return p;
}

function getFfmpegPath() {
  const ext = process.platform === 'win32' ? '.exe' : '';
  const bundled = getResourcePath('bin/ffmpeg' + ext);
  if (fs.existsSync(bundled)) return bundled;

  // Try ffmpeg-static package (resolve asar path to unpacked)
  try {
    const p = asarUnpack(require('ffmpeg-static'));
    if (p && fs.existsSync(p)) return p;
  } catch {}

  return 'ffmpeg';
}

function getFfprobePath() {
  const ext = process.platform === 'win32' ? '.exe' : '';
  const bundled = getResourcePath('bin/ffprobe' + ext);
  if (fs.existsSync(bundled)) return bundled;

  try {
    const p = asarUnpack(require('ffprobe-static').path);
    if (p && fs.existsSync(p)) return p;
  } catch {}

  return 'ffprobe';
}

function getYtdlpPath() {
  const ext = process.platform === 'win32' ? '.exe' : '';
  const bundled = getResourcePath('bin/yt-dlp' + ext);
  if (require('fs').existsSync(bundled)) return bundled;

  return 'yt-dlp';
}

// ─── Window ──────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 650,
    frame: false,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  } else {
    // Try dev server first, fallback to built files
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ─── Window Controls ─────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

// ─── Dialogs ─────────────────────────────────────────────────────────
ipcMain.handle('dialog:openFiles', async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: options.filters || [],
  });
  return result.filePaths;
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return result.filePaths[0] || null;
});

ipcMain.handle('shell:openPath', async (_, dirPath) => { shell.openPath(dirPath); });

// ─── Probe ───────────────────────────────────────────────────────────
ipcMain.handle('ffprobe:info', (_, filePath) => {
  return new Promise((resolve, reject) => {
    const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath];
    execFile(getFfprobePath(), args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err.message);
      try { resolve(JSON.parse(stdout)); } catch { reject('Failed to parse probe data'); }
    });
  });
});

// ─── Convert ─────────────────────────────────────────────────────────
const activeProcesses = new Map();

ipcMain.on('convert:start', (event, job) => {
  const args = buildFfmpegArgs(job);
  const proc = spawn(getFfmpegPath(), args, { windowsHide: true });
  activeProcesses.set(job.id, proc);

  let duration = 0;
  proc.stderr.on('data', (data) => {
    const line = data.toString();
    const durMatch = line.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/);
    if (durMatch) duration = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseInt(durMatch[3]);
    const timeMatch = line.match(/time=\s*(\d+):(\d+):(\d+)\.(\d+)/);
    if (timeMatch && duration > 0) {
      const current = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
      event.sender.send('convert:progress', { id: job.id, progress: Math.min(100, Math.round((current / duration) * 100)) });
    }
  });

  proc.on('close', (code) => {
    activeProcesses.delete(job.id);
    if (code === 0) {
      event.sender.send('convert:done', {
        id: job.id,
        type: job.type,
        displayName: job.displayName,
        outputName: job.outputName,
      });
    }
    else event.sender.send('convert:error', { id: job.id, error: `FFmpeg exited with code ${code}` });
  });

  proc.on('error', (err) => {
    activeProcesses.delete(job.id);
    event.sender.send('convert:error', { id: job.id, error: err.message });
  });
});

ipcMain.on('convert:cancel', (_, jobId) => {
  const proc = activeProcesses.get(jobId);
  if (proc) { proc.kill('SIGTERM'); activeProcesses.delete(jobId); }
});

function buildFfmpegArgs(job) {
  const args = ['-y', '-i', job.input];
  switch (job.type) {
    case 'image':
      if (job.quality && job.format === 'jpg') args.push('-q:v', String(Math.round(31 - (job.quality / 100) * 29)));
      if (job.quality && job.format === 'webp') args.push('-quality', String(job.quality));
      if (job.resize?.width && job.resize?.height) args.push('-vf', `scale=${job.resize.width}:${job.resize.height}`);
      else if (job.resize?.width) args.push('-vf', `scale=${job.resize.width}:-1`);
      else if (job.resize?.height) args.push('-vf', `scale=-1:${job.resize.height}`);
      break;
    case 'video':
      if (job.codec) args.push('-c:v', job.codec);
      if (job.audioCodec) args.push('-c:a', job.audioCodec);
      if (job.videoBitrate) args.push('-b:v', job.videoBitrate);
      if (job.audioBitrate) args.push('-b:a', job.audioBitrate);
      if (job.resolution) args.push('-vf', `scale=${job.resolution}`);
      if (job.fps) args.push('-r', String(job.fps));
      if (job.preset) args.push('-preset', job.preset);
      if (job.crf !== undefined && job.crf !== null) args.push('-crf', String(job.crf));
      break;
    case 'audio':
      args.push('-vn');
      if (job.audioCodec) args.push('-c:a', job.audioCodec);
      if (job.audioBitrate) args.push('-b:a', job.audioBitrate);
      if (job.sampleRate) args.push('-ar', String(job.sampleRate));
      break;
  }
  args.push(job.output);
  return args;
}

// ─── YouTube ─────────────────────────────────────────────────────────
ipcMain.on('ytdl:start', (event, job) => {
  const ytdlp = getYtdlpPath();
  const args = [];

  if (job.format === 'mp3') {
    args.push('-x', '--audio-format', 'mp3');
    if (job.audioBitrate) args.push('--audio-quality', job.audioBitrate);
  } else if (job.format === 'mp4') {
    if (job.resolution) args.push('-f', `bestvideo[height<=${job.resolution}]+bestaudio/best[height<=${job.resolution}]`);
    else args.push('-f', 'bestvideo+bestaudio/best');
    args.push('--merge-output-format', 'mp4');
  } else if (job.format === 'webm') {
    args.push('-f', 'bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]');
    args.push('--merge-output-format', 'webm');
  } else {
    args.push('-f', 'bestvideo+bestaudio/best');
    args.push('--merge-output-format', 'mkv');
  }

  args.push('--ffmpeg-location', path.dirname(getFfmpegPath()));
  args.push('-o', path.join(job.outputDir, '%(title)s.%(ext)s'));
  args.push('--newline', '--no-colors', job.url);

  const proc = spawn(ytdlp, args, { windowsHide: true });
  activeProcesses.set(job.id, proc);

  proc.stdout.on('data', (data) => {
    const line = data.toString();
    const match = line.match(/(\d+\.?\d*)%/);
    if (match) {
      event.sender.send('ytdl:progress', { id: job.id, progress: Math.min(100, Math.round(parseFloat(match[1]))), line: line.trim() });
    }
  });

  proc.stderr.on('data', (data) => {
    const line = data.toString().trim();
    if (line) event.sender.send('ytdl:log', { id: job.id, line });
  });

  proc.on('close', (code) => {
    activeProcesses.delete(job.id);
    if (code === 0) event.sender.send('ytdl:done', { id: job.id });
    else event.sender.send('ytdl:error', { id: job.id, error: `yt-dlp exited with code ${code}` });
  });

  proc.on('error', (err) => {
    activeProcesses.delete(job.id);
    event.sender.send('ytdl:error', { id: job.id, error: `Could not start yt-dlp: ${err.message}` });
  });
});

ipcMain.on('ytdl:cancel', (_, jobId) => {
  const proc = activeProcesses.get(jobId);
  if (proc) { proc.kill('SIGTERM'); activeProcesses.delete(jobId); }
});

ipcMain.handle('ytdl:info', (_, url) => {
  return new Promise((resolve, reject) => {
    execFile(getYtdlpPath(), ['-j', '--no-warnings', url], { maxBuffer: 10 * 1024 * 1024, timeout: 30000 }, (err, stdout) => {
      if (err) return reject(err.message);
      try {
        const info = JSON.parse(stdout);
        resolve({
          title: info.title,
          duration: info.duration_string || info.duration,
          thumbnail: info.thumbnail,
          uploader: info.uploader,
        });
      } catch { reject('Failed to parse video info'); }
    });
  });
});
