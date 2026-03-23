<script>
  import DropZone from './DropZone.svelte';
  import { queue, addToast, uid, dirname, stripExt } from '../stores/app.js';

  let files = [];
  let format = 'png';
  let quality = 90;
  let width = '';
  let height = '';
  let outputDir = '';

  async function pickDir() {
    const dir = await window.api?.openFolder();
    if (dir) outputDir = dir;
  }

  function convert() {
    if (!files.length) return addToast('No files selected', 'error');
    files.forEach(file => {
      const outDir = outputDir || dirname(file.path);
      const outName = stripExt(file.name) + '.' + format;
      window.api?.startConvert({
        id: uid(), type: 'image', input: file.path,
        output: outDir + '/' + outName, format, quality,
        resize: (width || height) ? { width: width ? parseInt(width) : null, height: height ? parseInt(height) : null } : null,
        displayName: file.name, outputName: outName,
      });
    });
    addToast(`Converting ${files.length} image(s)...`, 'info');
  }

  function addToQueue() {
    if (!files.length) return addToast('No files selected', 'error');
    const jobs = files.map(file => {
      const outDir = outputDir || dirname(file.path);
      const outName = stripExt(file.name) + '.' + format;
      return {
        id: uid(), type: 'image', input: file.path,
        output: outDir + '/' + outName, format, quality,
        resize: (width || height) ? { width: width ? parseInt(width) : null, height: height ? parseInt(height) : null } : null,
        displayName: file.name, outputName: outName, status: 'pending', progress: 0,
      };
    });
    queue.update(q => [...q, ...jobs]);
    addToast(`Added ${jobs.length} job(s) to queue`, 'info');
  }
</script>

<h2>Image Conversion</h2>
<p class="subtitle">Convert between PNG, JPG, WEBP, BMP, TIFF, GIF, ICO</p>

<DropZone
  bind:files
  label="Drop images here"
  hint="PNG, JPG, WEBP, BMP, TIFF, GIF, ICO, SVG"
  filters={[{ name: 'Images', extensions: ['png','jpg','jpeg','webp','bmp','tiff','tif','gif','ico','svg'] }]}
  icon={`<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>`}
/>

{#if files.length > 0}
  <div class="panel">
    <div class="row">
      <label>Output Format</label>
      <select bind:value={format}>
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="webp">WEBP</option>
        <option value="bmp">BMP</option>
        <option value="tiff">TIFF</option>
        <option value="gif">GIF</option>
        <option value="ico">ICO</option>
      </select>
    </div>
    <div class="row">
      <label>Quality <span class="val">{quality}</span></label>
      <input type="range" min="1" max="100" bind:value={quality}>
    </div>
    <div class="row">
      <label>Resize (optional)</label>
      <div class="pair">
        <input type="number" placeholder="Width" bind:value={width} min="1">
        <span class="x">&times;</span>
        <input type="number" placeholder="Height" bind:value={height} min="1">
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
  .row { margin-bottom: 14px; }
  .val { color: #fff; font-weight: 700; margin-left: 4px; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .pair { display: flex; align-items: center; gap: 8px; }
  .pair input { flex: 1; }
  .x { color: #444; }
  .folder-row { display: flex; gap: 8px; }
  .folder-row input { flex: 1; }
  .actions { display: flex; gap: 10px; margin-top: 18px; padding-top: 16px; border-top: 1px solid #1a1a1a; }
</style>
