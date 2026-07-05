<script>
  import logo from '../../../assets/icon.png';
  const api = window.api || {};
</script>

<header class="titlebar">
  <div class="brand">
    <img class="logo" src={logo} width="20" height="20" alt="" />
    <span class="title">Death By Media</span>
  </div>
  <div class="controls">
    <button class="win-btn" on:click={() => api.minimize?.()} title="Minimize">
      <svg viewBox="0 0 12 12" width="10" height="10"><rect y="5.6" width="12" height="1" fill="currentColor"/></svg>
    </button>
    <button class="win-btn" on:click={() => api.maximize?.()} title="Maximize">
      <svg viewBox="0 0 12 12" width="10" height="10"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>
    </button>
    <button class="win-btn close" on:click={() => api.close?.()} title="Close">
      <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1"/><line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" stroke-width="1"/></svg>
    </button>
  </div>
</header>

<style>
  .titlebar {
    height: 44px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding-left: 16px;
    -webkit-app-region: drag; user-select: none;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo { display: block; }
  .title { font-size: 12px; font-weight: 600; color: var(--text2); }

  .controls { display: flex; align-items: center; height: 100%; -webkit-app-region: no-drag; }
  .win-btn {
    width: 46px; height: 44px;
    border: none; background: transparent;
    color: var(--text2); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background var(--transition), color var(--transition);
  }
  .win-btn:hover { background: var(--hover); }
  .close:hover { background: #c42b1c; color: #ffffff; }
</style>
