<!-- OrderPanel.svelte -->
<script lang="ts">
  import {
    order,
    ui,
    closePanel,
    removeEntry,
    removeCustomItem,
    clearOrder,
  } from "../../stores/orderStore";
  import { onMount } from "svelte";

  // auto-subscriptions
  $: entries = $order.entries || [];
  $: open = $ui.panelOpen;
  $: total = entries.reduce(
    (acc, e) => acc + (e.unitPrice || 0) * e.quantity,
    0,
  );

  function handleRemove(entryId: string) {
    removeEntry(entryId);
  }

  function handleClose() {
    closePanel();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") handleClose();
  }

  // focus the panel when it opens
  $: if (open) {
    setTimeout(() => {
      const el = document.querySelector(".order-panel") as HTMLElement | null;
      if (el) el.focus();
    }, 0);
  }

  function handleGoPedido() {
    window.location.href = "/pedido";
  }

  function handleMerge() {
    // import merge function from store
    import("../../stores/orderStore").then((m) => m.mergeEntriesByProductId());
  }
</script>

{#if open}
  <div
    class="panel-overlay"
    role="presentation"
    on:click={handleClose}
    on:keydown={onKeydown}
  >
    <div
      class="order-panel"
      role="dialog"
      aria-label="Panel de pedido"
      tabindex="0"
      on:keydown={onKeydown}
    >
      <header>
        <h3>Tu Pedido</h3>
        <button class="close" on:click={handleClose}>×</button>
      </header>

      <div class="content">
        {#if entries.length === 0}
          <p class="empty">No hay productos en tu pedido.</p>
        {/if}

        <ul class="list">
          {#each entries as e}
            <li>
              <div class="row">
                <div class="left"><strong>{e.quantity}×</strong> {e.name}</div>
                <div class="right">
                  <span class="price"
                    >${((e.unitPrice || 0) * e.quantity).toFixed(2)}</span
                  >
                  <button
                    class="remove"
                    on:click={() => handleRemove(e.entryId)}
                    aria-label={`Eliminar ${e.name}`}>Eliminar</button
                  >
                </div>
              </div>
            </li>
          {/each}
        </ul>

        <div class="summary">
          <div>Total estimado: <strong>${total.toFixed(2)}</strong></div>
        </div>

        <div class="merge-wrap">
          <button class="small" on:click={handleMerge}>Fusionar entradas</button
          >
        </div>
        <div class="actions">
          <button class="primary" on:click={handleGoPedido}
            >Finalizar Pedido</button
          >
          <button class="cancel" on:click={clearOrder}>Cancelar pedido</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1500;
    display: flex;
    justify-content: flex-end;
  }
  .order-panel {
    width: 360px;
    max-width: 95vw;
    height: 100vh;
    background: #fff;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transform: translateX(10%);
    animation: slideIn 240ms ease-out forwards;
  }
  .order-panel header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .order-panel .content {
    overflow: auto;
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  .left {
    color: var(--text);
  }
  .right {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .price {
    color: var(--accent);
    font-weight: 600;
  }
  .remove {
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
  }
  .remove:hover,
  .remove:focus {
    text-decoration: underline;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .primary {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
  }
  .primary:hover,
  .primary:focus {
    filter: brightness(0.95);
  }
  .secondary {
    background: transparent;
    color: var(--primary);
    border: 1px solid var(--primary);
    padding: 0.4rem 0.7rem;
    border-radius: 0.5rem;
  }
  .secondary:hover,
  .secondary:focus {
    background: rgba(124, 77, 42, 0.06);
  }
  .close {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text);
  }
  .close:hover,
  .close:focus {
    color: var(--primary);
  }
  .empty {
    color: #6b5a50;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .cancel {
    background: transparent;
    color: var(--primary);
    border: 1px solid var(--primary);
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
  }
  .cancel:hover,
  .cancel:focus {
    background: rgba(124, 77, 42, 0.04);
  }
  .small {
    font-size: 0.85rem;
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
    margin-bottom: 0.5rem;
  }
  .small:hover,
  .small:focus {
    text-decoration: underline;
  }
</style>
