import { writable, derived, get } from 'svelte/store';

export const activeTab = writable('image');
export const queue = writable([]);
export const toasts = writable([]);

export const queuePending = derived(queue, $q => $q.filter(j => j.status === 'pending' || j.status === 'running').length);

let toastId = 0;
export function addToast(msg, type = 'info') {
  const id = ++toastId;
  toasts.update(t => [...t, { id, msg, type }]);
  setTimeout(() => toasts.update(t => t.filter(x => x.id !== id)), 2600);
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function basename(fp) {
  return fp.replace(/\\/g, '/').split('/').pop();
}

export function dirname(fp) {
  const parts = fp.replace(/\\/g, '/').split('/');
  parts.pop();
  return parts.join('/');
}

export function stripExt(name) {
  return name.replace(/\.[^.]+$/, '');
}

export const audioCodecMap = {
  mp3: 'libmp3lame', flac: 'flac', wav: 'pcm_s16le', aac: 'aac', ogg: 'libvorbis', m4a: 'aac',
};

// Hardware encoders usable on this machine (e.g. { h264_nvenc: true, ... }).
// Probed once by the main process; null until detection completes.
export const hwEncoders = writable(null);

// ─── Conversion queue ────────────────────────────────────────────────
// Jobs always live in the queue store so every conversion is visible as
// a task with progress, whether started directly or via "Add to queue".
// The IPC listeners are registered once at module load (not per tab) so
// processing keeps running no matter which tab is on screen.

let processing = false;
let runCount = 0;

export function enqueueJobs(jobs, { start = false } = {}) {
  queue.update(q => [...q, ...jobs.map(j => ({ status: 'pending', progress: 0, ...j }))]);
  if (start) startQueue({ silent: true });
}

export function startQueue({ silent = false } = {}) {
  const q = get(queue);
  if (!q.some(j => j.status === 'pending' || j.status === 'running')) {
    if (!silent) addToast('No pending jobs', 'error');
    return;
  }
  processing = true;
  // If a job is already running, the done/error handler will advance.
  if (!q.some(j => j.status === 'running')) processNext();
}

function processNext() {
  if (!processing) return;
  const next = get(queue).find(j => j.status === 'pending');
  if (!next) {
    processing = false;
    if (runCount > 1) addToast('Queue complete!', 'success');
    runCount = 0;
    return;
  }
  runCount += 1;
  queue.update(q => q.map(j => j.id === next.id ? { ...j, status: 'running' } : j));
  window.api?.startConvert(next);
}

export function removeJob(id) {
  const job = get(queue).find(j => j.id === id);
  if (!job) return;
  queue.update(q => q.filter(j => j.id !== id));
  if (job.status === 'running') {
    window.api?.cancelConvert(id);
    processNext();
  }
}

export function clearQueue() {
  get(queue).forEach(j => { if (j.status === 'running') window.api?.cancelConvert(j.id); });
  queue.set([]);
  processing = false;
  runCount = 0;
}

// ─── YouTube download state ──────────────────────────────────────────
// Lives here (not in the tab component) so a download survives tab
// switches and its progress is always tracked.

export const ytUrl = writable('');
export const ytFormat = writable('best');
export const ytResolution = writable('');
export const ytOutputDir = writable('');
export const ytInfo = writable(null);
export const ytFetching = writable(false);
export const ytJob = writable({ id: null, downloading: false, progress: 0, line: '' });

export async function fetchYtInfo() {
  const url = get(ytUrl).trim();
  if (!url) return addToast('Paste a YouTube URL first', 'error');
  ytFetching.set(true);
  try {
    ytInfo.set(await window.api?.getVideoInfo(url));
  } catch (err) {
    addToast(`Failed: ${err}`, 'error');
  }
  ytFetching.set(false);
}

export function startYtDownload() {
  const url = get(ytUrl).trim();
  if (!url) return addToast('Paste a YouTube URL first', 'error');
  const outputDir = get(ytOutputDir);
  if (!outputDir) return addToast('Select a download folder', 'error');
  const id = uid();
  ytJob.set({ id, downloading: true, progress: 0, line: '' });
  window.api?.startYtdl({
    id, url, format: get(ytFormat),
    resolution: get(ytResolution) || null,
    outputDir, audioBitrate: '0',
  });
}

export function cancelYtDownload() {
  const { id } = get(ytJob);
  if (id) window.api?.cancelYtdl(id);
  ytJob.set({ id: null, downloading: false, progress: 0, line: '' });
  addToast('Download cancelled', 'info');
}

// ─── Global IPC listeners (registered exactly once) ──────────────────

if (typeof window !== 'undefined' && window.api) {
  window.api.detectEncoders?.().then(m => hwEncoders.set(m || {})).catch(() => hwEncoders.set({}));

  window.api.onConvertProgress?.((d) => {
    queue.update(q => q.map(j => j.id === d.id ? { ...j, progress: d.progress, status: 'running' } : j));
  });
  window.api.onConvertDone?.((d) => {
    queue.update(q => q.map(j => j.id === d.id ? { ...j, progress: 100, status: 'done' } : j));
    addToast(`${d.displayName || d.outputName || 'Job'} complete!`, 'success');
    processNext();
  });
  window.api.onConvertError?.((d) => {
    queue.update(q => q.map(j => j.id === d.id ? { ...j, status: 'error' } : j));
    addToast(`Error: ${d.error}`, 'error');
    processNext();
  });

  window.api.onYtdlProgress?.((d) => {
    ytJob.update(s => s.id === d.id ? { ...s, progress: d.progress, line: d.line || '' } : s);
  });
  window.api.onYtdlDone?.((d) => {
    if (get(ytJob).id !== d.id) return;
    ytJob.set({ id: null, downloading: false, progress: 100, line: '' });
    addToast('Download complete!', 'success');
  });
  window.api.onYtdlError?.((d) => {
    if (get(ytJob).id !== d.id) return;
    ytJob.set({ id: null, downloading: false, progress: 0, line: '' });
    addToast(`Error: ${d.error}`, 'error');
  });
}
