<script>
  import { onMount } from 'svelte';
  import Titlebar from './lib/components/Titlebar.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import ImageTab from './lib/components/ImageTab.svelte';
  import VideoTab from './lib/components/VideoTab.svelte';
  import AudioTab from './lib/components/AudioTab.svelte';
  import YoutubeTab from './lib/components/YoutubeTab.svelte';
  import QueueTab from './lib/components/QueueTab.svelte';
  import Toasts from './lib/components/Toasts.svelte';
  import { activeTab } from './lib/stores/app.js';

  onMount(() => {
    const preventWindowDrop = (e) => {
      if (!Array.from(e.dataTransfer?.types || []).includes('Files')) return;
      e.preventDefault();
    };

    window.addEventListener('dragover', preventWindowDrop);
    window.addEventListener('drop', preventWindowDrop);

    return () => {
      window.removeEventListener('dragover', preventWindowDrop);
      window.removeEventListener('drop', preventWindowDrop);
    };
  });
</script>

<div class="blobs" aria-hidden="true">
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
</div>

<div class="shell">
  <Titlebar />
  <div class="app-layout">
    <Sidebar />
    <main class="content">
      {#if $activeTab === 'image'}<ImageTab />
      {:else if $activeTab === 'video'}<VideoTab />
      {:else if $activeTab === 'audio'}<AudioTab />
      {:else if $activeTab === 'youtube'}<YoutubeTab />
      {:else if $activeTab === 'queue'}<QueueTab />
      {/if}
    </main>
  </div>
</div>

<Toasts />

<style>
  .blobs {
    position: fixed; inset: 0;
    overflow: hidden; pointer-events: none;
  }
  /* With real acrylic translucency the painted refraction blobs would tint
     the genuine backdrop — only keep them for the solid fallback. */
  :global([data-glass]) .blobs { display: none; }
  .blob { position: absolute; }
  .b1 {
    width: 560px; height: 560px; left: -140px; top: -180px;
    background: radial-gradient(circle, var(--blob3), transparent 70%);
    filter: blur(48px);
  }
  .b2 {
    width: 640px; height: 640px; right: -180px; top: 160px;
    background: radial-gradient(circle, var(--blob1), transparent 70%);
    filter: blur(56px);
  }
  .b3 {
    width: 480px; height: 480px; left: 340px; bottom: -220px;
    background: radial-gradient(circle, var(--blob2), transparent 70%);
    filter: blur(52px);
  }

  .shell {
    position: relative;
    height: 100vh;
    display: flex; flex-direction: column;
  }
  .app-layout {
    display: flex;
    flex: 1;
    min-height: 0;
  }
  .content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 20px 36px 32px 12px;
  }
</style>
