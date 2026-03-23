<script>
  import DropZone from './DropZone.svelte';
  import { queue, addToast, uid, dirname, stripExt, audioCodecMap } from '../stores/app.js';

  let files = [];
  let format = 'mp3';
  let bitrate = '192k';
  let sampleRate = '';
  let outputDir = '';

  async function pickDir() {
    const dir = await window.api?.openFolder();
    if (dir) outputDir = dir;
  }

  function buildJob(file) {
    const outDir = outputDir || dirname(file.path);
    const outName = stripExt(file.name) + '.' + format;
    return {
      id: uid(), type: 'audio', input: file.path, output: outDir + '/' + outName,
      format, audioCodec: audioCodecMap[format] || format,
      audioBitrate: bitrate, sampleRate: sampleRate || null,
      displayName: file.name, outputName: outName,
    };
  }

  function convert() {
    if (!files.length) return addToast('No files selected', 'error');
    files.forEach(f => window.api?.startConvert(buildJob(f)));
    addToast(`Extracting audio from ${files.length} file(s)...`, 'info');
  }

  function addToQueue() {
    if (!files.length) return addToast('No files selected', 'error');
    const jobs = files.map(f => ({ ...buildJob(f), status: 'pending', progress: 0 }));
    queue.update(q => [...q, ...jobs]);
    addToast(`Added ${jobs.length} job(s) to queue`, 'info');
  }
</script>

<h2>Audio Extraction</h2>
<p class="subtitle">Extract audio from video files to MP3, FLAC, WAV, AAC, OGG</p>

<DropZone
  bind:files
  label="Drop video/audio files here"
  hint="Any video or audio format with an audio track"
  filters={[{ name: 'Media', extensions: ['mp4','mkv','avi','mov','webm','flv','wmv','mp3','flac','wav','aac','ogg','m4a','wma'] }]}
  icon={`<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`}
/>

{#if files.length > 0}
  <div class="panel">
    <div class="grid">
      <div class="row">
        <label for="format">Output Format</label>
        <select id="format" bind:value={format}>
          <option value="mp3">MP3</option><option value="flac">FLAC</option>
          <option value="wav">WAV</option><option value="aac">AAC</option>
          <option value="ogg">OGG</option><option value="m4a">M4A</option>
        </select>
      </div>
      <div class="row">
        <label for="bitrate">Bitrate</label>
        <select id="bitrate" bind:value={bitrate}>
          <option value="320k">320 kbps</option><option value="256k">256 kbps</option>
          <option value="192k">192 kbps</option><option value="128k">128 kbps</option>
          <option value="96k">96 kbps</option>
        </select>
      </div>
      <div class="row">
        <label for="sampleRate">Sample Rate</label>
        <select id="sampleRate" bind:value={sampleRate}>
          <option value="">Original</option><option value="48000">48 kHz</option>
          <option value="44100">44.1 kHz</option><option value="22050">22.05 kHz</option>
        </select>
      </div>
    </div>
    <div class="row">
      <label for="outputDir">Output Folder</label>
      <div class="folder-row">
        <input id="outputDir" type="text" value={outputDir} placeholder="Same as source" readonly>
        <button class="btn btn-secondary btn-sm" on:click={pickDir}>Browse</button>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-primary" on:click={convert}>Extract Audio</button>
      <button class="btn btn-secondary" on:click={addToQueue}>Add to Queue</button>
    </div>
  </div>
{/if}

<style>
  .panel { margin-top: 20px; padding: 20px; background: #0a0a0a; border-radius: 12px; border: 1px solid #1a1a1a; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .row { margin-bottom: 14px; }
  .folder-row { display: flex; gap: 8px; }
  .folder-row input { flex: 1; }
  .actions { display: flex; gap: 10px; margin-top: 18px; padding-top: 16px; border-top: 1px solid #1a1a1a; }
</style>
