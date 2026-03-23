<script>
  import { onMount } from 'svelte';
  import { queue, addToast } from '../stores/app.js';

  let running = false;

  function removeItem(idx) {
    queue.update(q => {
      const job = q[idx];
      if (job.status === 'running') window.api?.cancelConvert(job.id);
      return q.filter((_, i) => i !== idx);
    });
  }

  function clearAll() {
    queue.update(q => {
      q.forEach(j => { if (j.status === 'running') window.api?.cancelConvert(j.id); });
      return [];
    });
    running = false;
    addToast('Queue cleared', 'info');
  }

  function startAll() {
    const pending = $queue.filter(j => j.status === 'pending');
    if (!pending.length) return addToast('No pending jobs', 'error');
    running = true;
    processNext();
  }

  function processNext() {
    if (!running) return;
    const next = $queue.find(j => j.status === 'pending');
    if (!next) { running = false; addToast('Queue complete!', 'success'); return; }
    next.status = 'running';
    queue.set($queue);
    window.api?.startConvert(next);
  }

  onMount(() => {
    const offProgress = window.api?.onConvertProgress((d) => {
      queue.update(q => q.map(j => j.id === d.id ? { ...j, progress: d.progress, status: 'running' } : j));
    });
    const offDone = window.api?.onConvertDone((d) => {
      queue.update(q => q.map(j => j.id === d.id ? { ...j, progress: 100, status: 'done' } : j));
      addToast(`✓ ${d.displayName || d.outputName || 'Job'} done`, 'success');
      processNext();
    });
    const offError = window.api?.onConvertError((d) => {
      queue.update(q => q.map(j => j.id === d.id ? { ...j, status: 'error' } : j));
      addToast(`Error: ${d.error}`, 'error');
      processNext();
    });

    return () => {
      offProgress?.();
      offDone?.();
      offError?.();
    };
  });
</script>

<h2>Batch Queue</h2>
<p class="subtitle">Process multiple conversion jobs</p>

{#if $queue.length === 0}
  <div class="empty">
    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.15">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6" stroke-width="3" stroke-linecap="round"/>
      <line x1="3" y1="12" x2="3.01" y2="12" stroke-width="3" stroke-linecap="round"/>
      <line x1="3" y1="18" x2="3.01" y2="18" stroke-width="3" stroke-linecap="round"/>
    </svg>
    <p>Queue is empty</p>
    <span class="hint">Add jobs from Image, Video, or Audio tabs</span>
  </div>
{:else}
  <div class="list">
    {#each $queue as job, idx (job.id)}
      <div class="item">
        <div class="icon" class:img={job.type==='image'} class:vid={job.type==='video'} class:aud={job.type==='audio'}>
          {job.type === 'image' ? 'IMG' : job.type === 'video' ? 'VID' : 'AUD'}
        </div>
        <div class="info">
          <div class="name" title={job.displayName}>{job.displayName}</div>
          <div class="detail">{job.type} &rarr; {job.format || job.outputName}</div>
        </div>
        <div class="prog-mini">
          <div class="prog-bar"><div class="prog-fill" style="width:{job.progress}%"></div></div>
        </div>
        <span class="status" class:pending={job.status==='pending'} class:running={job.status==='running'} class:done={job.status==='done'} class:error={job.status==='error'}>
          {job.status === 'done' ? '✓ Completed' : job.status === 'error' ? '✕ Error' : job.status === 'running' ? '⟳ Running' : 'Pending'}
        </span>
        <button class="remove" on:click={() => removeItem(idx)}>&times;</button>
      </div>
    {/each}
  </div>
  <div class="controls">
    <button class="btn btn-primary" on:click={startAll}>Start All</button>
    <button class="btn btn-danger" on:click={clearAll}>Clear Queue</button>
  </div>
{/if}

<style>
  .empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; text-align: center; }
  .empty p { color: #666; font-size: 15px; }
  .hint { color: #444; font-size: 11px; }

  .list { display: flex; flex-direction: column; gap: 6px; }
  .item {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    background: #0a0a0a; border-radius: 8px; border: 1px solid #1a1a1a;
  }
  .icon {
    width: 34px; height: 34px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .img { background: rgba(255,255,255,0.06); color: #aaa; }
  .vid { background: rgba(255,255,255,0.06); color: #ccc; }
  .aud { background: rgba(255,255,255,0.06); color: #999; }
  .info { flex: 1; min-width: 0; }
  .name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .detail { color: #555; font-size: 11px; margin-top: 1px; }

  .prog-mini { width: 90px; flex-shrink: 0; }
  .prog-bar { height: 3px; background: #1a1a1a; border-radius: 2px; overflow: hidden; }
  .prog-fill { height: 100%; background: #fff; border-radius: 2px; transition: width 300ms ease; }

  .status { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; width: 88px; text-align: center; }
  .pending { color: #555; }
  .running { color: #aaa; }
  .done { color: #4caf50; }
  .error { color: #cc4444; }

  .remove {
    width: 26px; height: 26px; border: none; background: transparent;
    color: #444; cursor: pointer; border-radius: 4px; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .remove:hover { background: rgba(204,68,68,0.12); color: #cc4444; }

  .controls { display: flex; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #1a1a1a; }
</style>
