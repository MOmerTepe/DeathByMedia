<script>
  import { basename } from '../stores/app.js';
  export let files = [];
  export let label = 'Drop files here';
  export let hint = '';
  export let filters = [];
  export let icon = `<rect x="3" y="3" width="18" height="18" rx="2"/>`;

  let dragging = false;
  let dragDepth = 0;

  async function browse() {
    const api = window.api;
    if (!api) return;
    const paths = await api.openFiles({ filters });
    if (paths.length) addFiles(paths);
  }

  function addFiles(paths) {
    const existing = new Set(files.map(f => f.path));
    const newFiles = paths.filter(p => !existing.has(p)).map(p => ({ path: p, name: basename(p) }));
    files = [...files, ...newFiles];
  }

  function removeFile(idx) {
    files = files.filter((_, i) => i !== idx);
  }

  function hasFilePayload(dataTransfer) {
    return Array.from(dataTransfer?.types || []).includes('Files');
  }

  function getDroppedPaths(dataTransfer) {
    const files = [
      ...Array.from(dataTransfer?.items || [])
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile?.())
        .filter(Boolean),
      // fallback: dataTransfer.files if items gave nothing
      ...(Array.from(dataTransfer?.items || []).filter(i => i.kind === 'file').length === 0
        ? Array.from(dataTransfer?.files || [])
        : []),
    ];

    return files
      .map(file => {
        // Electron 28+ preferred API via preload
        if (window.api?.getFilePath) {
          try { return window.api.getFilePath(file); } catch {}
        }
        // fallback for older Electron or dev browser
        return file.path || '';
      })
      .filter(Boolean);
  }

  function onDragEnter(e) {
    if (!hasFilePayload(e.dataTransfer)) return;
    e.preventDefault();
    dragDepth += 1;
    dragging = true;
  }

  function onDragOver(e) {
    if (!hasFilePayload(e.dataTransfer)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    dragging = true;
  }

  function onDragLeave(e) {
    if (!hasFilePayload(e.dataTransfer)) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) dragging = false;
  }

  function onDrop(e) {
    if (!hasFilePayload(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepth = 0;
    dragging = false;
    addFiles(getDroppedPaths(e.dataTransfer));
  }

</script>

<div
  class="drop-shell"
  class:dragging
  role="presentation"
  on:dragenter={onDragEnter}
  on:dragover={onDragOver}
  on:dragleave={onDragLeave}
  on:drop={onDrop}
>
  {#if files.length === 0}
    <div
      class="dropzone"
      on:click={browse}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && browse()}
    >
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.2">{@html icon}</svg>
      <p>{label} or <button class="link" on:click|stopPropagation={browse}>browse</button></p>
      {#if hint}<span class="hint">{hint}</span>{/if}
    </div>
  {:else}
    <div class="file-list">
      {#each files as file, idx}
        <div class="file-item">
          <span class="fname" title={file.path}>{file.name}</span>
          <button class="remove" on:click={() => removeFile(idx)}>&times;</button>
        </div>
      {/each}
      <button class="btn btn-ghost btn-sm add-more" on:click={browse}>+ Add more</button>
    </div>
  {/if}
</div>

<style>
  .drop-shell { position: relative; }
  .dropzone {
    border: 1.5px dashed #1e1e1e; border-radius: 12px;
    padding: 44px 20px; text-align: center; cursor: pointer;
    transition: all 120ms ease;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .dropzone:hover, .drop-shell.dragging .dropzone { border-color: #444; background: rgba(255,255,255,0.02); }
  .dropzone p { color: #666; font-size: 14px; }
  .hint { color: #444; font-size: 11px; }
  .link { background: none; border: none; color: #aaa; cursor: pointer; font-size: inherit; text-decoration: underline; text-underline-offset: 2px; font-family: inherit; }
  .link:hover { color: #fff; }

  .file-list { display: flex; flex-direction: column; gap: 4px; }
  .drop-shell.dragging .file-list {
    background: rgba(255,255,255,0.02);
    border: 1.5px dashed #444;
    border-radius: 12px;
    padding: 10px;
  }
  .file-item {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 14px; background: #0a0a0a; border-radius: 8px;
    border: 1px solid #1a1a1a;
  }
  .fname { flex: 1; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .remove {
    width: 24px; height: 24px; border: none; background: transparent;
    color: #555; cursor: pointer; border-radius: 4px; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .remove:hover { background: rgba(204,68,68,0.12); color: #cc4444; }
  .add-more { align-self: flex-start; margin-top: 4px; }
</style>
