<script>
  import { toasts } from '../stores/app.js';
</script>

<div class="toast-container">
  {#each $toasts as toast (toast.id)}
    <div class="toast {toast.type}">
      {toast.msg}
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed; bottom: 20px; right: 20px;
    display: flex; flex-direction: column-reverse; gap: 6px;
    z-index: 999; pointer-events: none;
  }
  .toast {
    padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
    pointer-events: auto; animation: slideIn 200ms ease; max-width: 340px;
  }
  .toast.success { background: rgba(255,255,255,0.08); color: #ccc; border: 1px solid #222; }
  .toast.error { background: rgba(204,68,68,0.12); color: #cc4444; border: 1px solid rgba(204,68,68,0.2); }
  .toast.info { background: rgba(255,255,255,0.06); color: #999; border: 1px solid #1e1e1e; }

  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
