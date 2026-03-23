<script>
  import { activeTab, queuePending } from '../stores/app.js';

  const tabs = [
    { id: 'image', label: 'Image', icon: 'M3,3H21a2,2,0,0,1,0,4H3A2,2,0,0,1,3,3Z', svg: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>` },
    { id: 'video', label: 'Video', svg: `<rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16"/>` },
    { id: 'audio', label: 'Audio', svg: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>` },
    { id: 'youtube', label: 'YouTube', svg: `<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48"/>` },
  ];
</script>

<nav class="sidebar">
  {#each tabs as tab}
    <button
      class="nav-btn"
      class:active={$activeTab === tab.id}
      on:click={() => $activeTab = tab.id}
    >
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8">{@html tab.svg}</svg>
      <span>{tab.label}</span>
    </button>
  {/each}

  <div class="spacer"></div>

  <button class="nav-btn" class:active={$activeTab === 'queue'} on:click={() => $activeTab = 'queue'}>
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6" stroke-width="3" stroke-linecap="round"/>
      <line x1="3" y1="12" x2="3.01" y2="12" stroke-width="3" stroke-linecap="round"/>
      <line x1="3" y1="18" x2="3.01" y2="18" stroke-width="3" stroke-linecap="round"/>
    </svg>
    <span>Queue</span>
    {#if $queuePending > 0}
      <span class="badge">{$queuePending}</span>
    {/if}
  </button>
</nav>

<style>
  .sidebar {
    width: 70px; background: #050505; border-right: 1px solid #1a1a1a;
    display: flex; flex-direction: column; align-items: center;
    padding: 12px 0; gap: 2px;
  }
  .nav-btn {
    width: 54px; height: 50px; border: none; background: transparent;
    color: #555; cursor: pointer; border-radius: 8px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; font-size: 9.5px; font-weight: 600; letter-spacing: 0.2px;
    transition: all 120ms ease; position: relative; font-family: inherit;
  }
  .nav-btn:hover { background: #111; color: #888; }
  .nav-btn.active { background: rgba(255,255,255,0.06); color: #fff; }
  .spacer { flex: 1; }
  .badge {
    position: absolute; top: 3px; right: 4px;
    background: #fff; color: #000; font-size: 9px; font-weight: 700;
    min-width: 15px; height: 15px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px;
  }
</style>
