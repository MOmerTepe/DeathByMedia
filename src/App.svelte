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
  import { activeTab, addToast } from './lib/stores/app.js';

  onMount(() => {
    const preventWindowDrop = (e) => {
      if (!Array.from(e.dataTransfer?.types || []).includes('Files')) return;
      e.preventDefault();
    };

    const offConvertDone = window.api?.onConvertDone((job) => {
      const label = job.displayName || job.outputName || 'Task';
      addToast(`${label} complete!`, 'success');
    });

    window.addEventListener('dragover', preventWindowDrop);
    window.addEventListener('drop', preventWindowDrop);

    return () => {
      offConvertDone?.();
      window.removeEventListener('dragover', preventWindowDrop);
      window.removeEventListener('drop', preventWindowDrop);
    };
  });
</script>

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

<Toasts />

<style>
  .app-layout {
    display: flex;
    height: calc(100vh - 36px);
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
  }
</style>
