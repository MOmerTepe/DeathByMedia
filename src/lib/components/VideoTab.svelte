<script>
  import DropZone from './DropZone.svelte';
  import { queue, addToast, uid, dirname, stripExt } from '../stores/app.js';

  let files = [];
  let format = 'mp4';
  let codec = 'libx264';
  let acodec = 'aac';
  let preset = 'medium';
  let crf = 23;
  let resolution = '';
  let fps = '';
  let abitrate = '192k';
  let outputDir = '';

  async function pickDir() {
    const dir = await window.api?.openFolder();
    if (dir) outputDir = dir;
  }

  function buildJob(file) {
    const outDir = outputDir || dirname(file.path);
    const outName = stripExt(file.name) + '_converted.' + format;
    return {
      id: uid(), type: 'video', input: file.path, output: outDir + '/' + outName,
      format, codec, audioCodec: acodec, preset, crf,
      resolution: resolution || null, fps: fps || null, audioBitrate: abitrate,
      displayName: file.name, outputName: outName,
    };
  }

  function convert() {
    if (!files.length) return addToast('No files selected', 'error');
    files.forEach(f => window.api?.startConvert(buildJob(f)));
    addToast(`Converting ${files.length} video(s)...`, 'info');
  }

  function addToQueue() {
    if (!files.length) return addToast('No files selected', 'error');
    const jobs = files.map(f => ({ ...buildJob(f), status: 'pending', progress: 0 }));
    queue.update(q => [...q, ...jobs]);
    addToast(`Added ${jobs.length} job(s) to queue`, 'info');
  }
</script>

<h2>Video Conversion</h2>
<p class="subtitle">Convert between MP4, MKV, AVI, MOV, WEBM, FLV with codec options</p>

<DropZone
  bind:files
  label="Drop videos here"
  hint="MP4, MKV, AVI, MOV, WEBM, FLV, WMV, TS"
  filters={[{ name: 'Videos', extensions: ['mp4','mkv','avi','mov','webm','flv','wmv','ts','m4v'] }]}
  icon={`<rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16"/>`}
/>

{#if files.length > 0}
  <div class="panel">
    <div class="grid">
      <div class="row">
        <label>Output Format</label>
        <select bind:value={format}>
          <option value="mp4">MP4</option><option value="mkv">MKV</option>
          <option value="avi">AVI</option><option value="mov">MOV</option>
          <option value="webm">WEBM</option><option value="flv">FLV</option>
        </select>
      </div>
      <div class="row">
        <label>Video Codec</label>
        <select bind:value={codec}>
          <option value="libx264">H.264 (x264)</option><option value="libx265">H.265 (x265)</option>
          <option value="libvpx-vp9">VP9</option><option value="copy">Copy (no re-encode)</option>
        </select>
      </div>
      <div class="row">
        <label>Audio Codec</label>
        <select bind:value={acodec}>
          <option value="aac">AAC</option><option value="libmp3lame">MP3</option>
          <option value="libopus">Opus</option><option value="copy">Copy</option>
        </select>
      </div>
      <div class="row">
        <label>Preset</label>
        <select bind:value={preset}>
          <option value="ultrafast">Ultrafast</option><option value="fast">Fast</option>
          <option value="medium">Medium</option><option value="slow">Slow</option>
          <option value="veryslow">Very Slow</option>
        </select>
      </div>
      <div class="row">
        <label>CRF Quality <span class="val">{crf}</span></label>
        <input type="range" min="0" max="51" bind:value={crf}>
      </div>
      <div class="row">
        <label>Resolution</label>
        <select bind:value={resolution}>
          <option value="">Original</option><option value="3840:-1">4K</option>
          <option value="1920:-1">1080p</option><option value="1280:-1">720p</option>
          <option value="854:-1">480p</option><option value="640:-1">360p</option>
        </select>
      </div>
      <div class="row">
        <label>FPS</label>
        <select bind:value={fps}>
          <option value="">Original</option><option value="60">60</option>
          <option value="30">30</option><option value="24">24</option>
        </select>
      </div>
      <div class="row">
        <label>Audio Bitrate</label>
        <select bind:value={abitrate}>
          <option value="320k">320 kbps</option><option value="256k">256 kbps</option>
          <option value="192k">192 kbps</option><option value="128k">128 kbps</option>
        </select>
      </div>
    </div>
    <div class="row">
      <label>Output Folder</label>
      <div class="folder-row">
        <input type="text" value={outputDir} placeholder="Same as source" readonly>
        <button class="btn btn-secondary btn-sm" on:click={pickDir}>Browse</button>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-primary" on:click={convert}>Convert</button>
      <button class="btn btn-secondary" on:click={addToQueue}>Add to Queue</button>
    </div>
  </div>
{/if}

<style>
  .panel { margin-top: 20px; padding: 20px; background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .row { margin-bottom: 14px; }
  .val { color: #fff; font-weight: 700; margin-left: 4px; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .folder-row { display: flex; gap: 8px; }
  .folder-row input { flex: 1; }
  .actions { display: flex; gap: 10px; margin-top: 18px; padding-top: 16px; border-top: 1px solid #1a1a1a; }
</style>
