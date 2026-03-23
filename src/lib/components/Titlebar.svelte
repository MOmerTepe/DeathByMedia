<script>
  import logo from '../../../assets/icon.png';
  const api = window.api || {};
</script>

<header class="titlebar">
  <div class="drag">
    <img src={logo} width="16" height="16" alt="logo" class="logo" />
    <span class="title">Death By Media</span>
  </div>
  <div class="controls">
    <button on:click={() => api.minimize?.()} title="Minimize">
      <svg viewBox="0 0 12 12" width="11" height="11"><rect y="5.5" width="12" height="1.2" fill="currentColor"/></svg>
    </button>
    <button on:click={() => api.maximize?.()} title="Maximize">
      <svg viewBox="0 0 12 12" width="11" height="11"><rect x="1.2" y="1.2" width="9.6" height="9.6" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>
    </button>
    <button class="close" on:click={() => api.close?.()} title="Close">
      <svg viewBox="0 0 12 12" width="11" height="11"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.4"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.4"/></svg>
    </button>
  </div>
</header>

<style>
  .titlebar {
    display: flex; align-items: center; justify-content: space-between;
    height: 36px; background: #050505; border-bottom: 1px solid #1a1a1a;
    -webkit-app-region: drag; padding: 0 8px; user-select: none;
  }
  .drag { display: flex; align-items: center; gap: 8px; padding-left: 6px; }
  .logo { color: #ffffff; }
  .title { font-size: 12px; font-weight: 600; color: #666; letter-spacing: 0.3px; }
  .controls { display: flex; gap: 2px; -webkit-app-region: no-drag; }
  .controls button {
    width: 36px; height: 28px; border: none; background: transparent;
    color: #666; cursor: pointer; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: all 120ms ease;
  }
  .controls button:hover { background: #1a1a1a; color: #ccc; }
  .close:hover { background: #cc3333 !important; color: white !important; }
</style>
