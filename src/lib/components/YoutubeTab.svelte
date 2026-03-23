<script>
  import { onMount } from 'svelte';
  import { addToast, uid } from '../stores/app.js';

  let url = '';
  let format = 'best';
  let resolution = '';
  let outputDir = '';
  let fetching = false;
  let downloading = false;
  let jobId = null;
  let progress = 0;
  let progressLine = '';
  let info = null;

  async function fetchInfo() {
    if (!url.trim()) return addToast('Enter a URL first', 'error');
    fetching = true;
    try {
      info = await window.api?.getVideoInfo(url.trim());
    } catch (err) {
      addToast(`Failed: ${err}`, 'error');
    }
    fetching = false;
  }

  async function pickDir() {
    const dir = await window.api?.openFolder();
    if (dir) outputDir = dir;
  }

  function download() {
    if (!url.trim()) return addToast('Enter a URL', 'error');
    if (!outputDir) return addToast('Select a download folder', 'error');
    jobId = uid();
    downloading = true;
    progress = 0;
    progressLine = '';
    window.api?.startYtdl({ id: jobId, url: url.trim(), format, resolution: resolution || null, outputDir, audioBitrate: '0' });
  }

  function cancel() {
    if (jobId) window.api?.cancelYtdl(jobId);
    downloading = false;
    jobId = null;
    addToast('Download cancelled', 'info');
  }

  onMount(() => {
    window.api?.onYtdlProgress((d) => { if (d.id === jobId) { progress = d.progress; progressLine = d.line || ''; } });
    window.api?.onYtdlDone((d) => {
      if (d.id !== jobId) return;
      progress = 100; downloading = false; jobId = null;
      addToast('Download complete!', 'success');
    });
    window.api?.onYtdlError((d) => {
      if (d.id !== jobId) return;
      downloading = false; jobId = null;
      addToast(`Error: ${d.error}`, 'error');
    });
  });
</script>

<h2>YouTube Downloader</h2>
<p class="subtitle">Download videos or extract audio from YouTube</p>

<div class="url-row">
  <input type="text" bind:value={url} placeholder="Paste YouTube URL here..." spellcheck="false">
  <button class="btn btn-primary" on:click={fetchInfo} disabled={fetching}>
    {fetching ? 'Fetching...' : 'Fetch Info'}
  </button>
</div>

{#if info}
  <div class="info-card">
    {#if info.thumbnail}
      <img src={info.thumbnail} alt="" class="thumb">
    {/if}
    <div class="meta">
      <h3>{info.title}</h3>
      {#if info.uploader}<p>{info.uploader}</p>{/if}
      {#if info.duration}<p>Duration: {info.duration}</p>{/if}
    </div>
  </div>
{/if}

<div class="panel">
  <div class="grid">
    <div class="row">
      <label for="format">Download Format</label>
      <select id="format" bind:value={format}>
        <option value="best">Best Quality (Video)</option>
        <option value="mp4">MP4</option>
        <option value="webm">WEBM</option>
        <option value="mp3">MP3 (Audio Only)</option>
      </select>
    </div>
    <div class="row">
      <label for="resolution">Max Resolution</label>
      <select id="resolution" bind:value={resolution}>
        <option value="">Best Available</option>
        <option value="2160">4K</option><option value="1080">1080p</option>
        <option value="720">720p</option><option value="480">480p</option>
      </select>
    </div>
  </div>
  <div class="row">
    <label for="outputDir">Save To</label>
    <div class="folder-row">
      <input id="outputDir" type="text" value={outputDir} placeholder="Select download folder..." readonly>
      <button class="btn btn-secondary btn-sm" on:click={pickDir}>Browse</button>
    </div>
  </div>
  <div class="actions">
    <button class="btn btn-primary" on:click={download} disabled={downloading || !outputDir}>Download</button>
  </div>
</div>

{#if downloading}
  <div class="progress-card">
    <div class="prog-header">
      <span>Downloading...</span>
      <span class="pct">{progress}%</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" style="width:{progress}%"></div></div>
    {#if progressLine}<p class="prog-detail">{progressLine}</p>{/if}
    <button class="btn btn-danger btn-sm" on:click={cancel}>Cancel</button>
  </div>
{/if}

<style>
  .url-row { display: flex; gap: 10px; margin-bottom: 16px; }
  .url-row input { flex: 1; height: 42px; font-size: 14px; }
  .url-row .btn { height: 42px; }

  .info-card {
    display: flex; gap: 14px; margin-bottom: 16px; padding: 14px;
    background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a;
  }
  .thumb { width: 150px; height: 84px; object-fit: cover; border-radius: 6px; background: #111; flex-shrink: 0; }
  .meta { flex: 1; min-width: 0; }
  .meta h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta p { color: #777; font-size: 12px; }

  .panel { padding: 20px; background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .row { margin-bottom: 14px; }
  .folder-row { display: flex; gap: 8px; }
  .folder-row input { flex: 1; }
  .actions { display: flex; gap: 10px; margin-top: 18px; padding-top: 16px; border-top: 1px solid #1a1a1a; }

  .progress-card {
    margin-top: 16px; padding: 16px; background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a;
  }
  .prog-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
  .pct { color: #fff; font-weight: 600; }
  .prog-bar { height: 5px; background: #1a1a1a; border-radius: 3px; overflow: hidden; }
  .prog-fill { height: 100%; background: #fff; border-radius: 3px; transition: width 300ms ease; }
  .prog-detail { color: #555; font-size: 11px; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
