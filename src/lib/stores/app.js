import { writable, derived } from 'svelte/store';

export const activeTab = writable('image');
export const queue = writable([]);
export const toasts = writable([]);

export const queuePending = derived(queue, $q => $q.filter(j => j.status === 'pending' || j.status === 'running').length);

let toastId = 0;
export function addToast(msg, type = 'info') {
  const id = ++toastId;
  toasts.update(t => [...t, { id, msg, type }]);
  setTimeout(() => toasts.update(t => t.filter(x => x.id !== id)), 3500);
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
