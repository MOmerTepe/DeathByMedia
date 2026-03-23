const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  openFiles: (opts) => ipcRenderer.invoke('dialog:openFiles', opts),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openPath: (dir) => ipcRenderer.invoke('shell:openPath', dir),
  probeFile: (fp) => ipcRenderer.invoke('ffprobe:info', fp),
  getFilePath: (file) => webUtils.getPathForFile(file),
  startConvert: (job) => ipcRenderer.send('convert:start', job),
  cancelConvert: (id) => ipcRenderer.send('convert:cancel', id),
  onConvertProgress: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('convert:progress', listener);
    return () => ipcRenderer.removeListener('convert:progress', listener);
  },
  onConvertDone: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('convert:done', listener);
    return () => ipcRenderer.removeListener('convert:done', listener);
  },
  onConvertError: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('convert:error', listener);
    return () => ipcRenderer.removeListener('convert:error', listener);
  },
  startYtdl: (job) => ipcRenderer.send('ytdl:start', job),
  cancelYtdl: (id) => ipcRenderer.send('ytdl:cancel', id),
  getVideoInfo: (url) => ipcRenderer.invoke('ytdl:info', url),
  onYtdlProgress: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('ytdl:progress', listener);
    return () => ipcRenderer.removeListener('ytdl:progress', listener);
  },
  onYtdlDone: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('ytdl:done', listener);
    return () => ipcRenderer.removeListener('ytdl:done', listener);
  },
  onYtdlError: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('ytdl:error', listener);
    return () => ipcRenderer.removeListener('ytdl:error', listener);
  },
  onYtdlLog: (cb) => {
    const listener = (_, d) => cb(d);
    ipcRenderer.on('ytdl:log', listener);
    return () => ipcRenderer.removeListener('ytdl:log', listener);
  },
});
