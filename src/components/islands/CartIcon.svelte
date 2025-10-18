<!-- CartIcon.svelte -->
<script lang="ts">
import { order, togglePanel } from '../../stores/orderStore';

// Svelte auto-subscription: $order is the current value
$: totalItems = $order.entries ? $order.entries.length : 0;
let prevTotal = 0;
let bumped = false;

// single reactive block driven by totalItems to avoid a cyclic dependency
$: if (totalItems > prevTotal) {
  bumped = true;
  // clear the bump after the animation duration
  setTimeout(() => (bumped = false), 400);
  prevTotal = totalItems;
}

  
</script>

  <button class="cart-icon" aria-label="Ver pedido" on:click={togglePanel}>
  <!-- box/package icon (inline SVG) -->
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 7.5L12 3l9 4.5v7L12 21 3 14.5v-7z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
    <path d="M12 3v9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
  {#if totalItems > 0}
    <span class:badge-bump={bumped} class="cart-badge">{totalItems}</span>
  {/if}
  </button>

<style>
.cart-icon {
  position: relative;
  font-size: 1.5rem;
  margin-left: 2rem;
  color: #fff;
  font-weight: 600; /* match logo weight */
}
.cart-badge {
  position: absolute;
  top: 62%; /* place in lower half */
  right: -6px; /* slightly to the right */
  background: var(--accent);
  color: var(--primary);
  border-radius: 50%;
  padding: 0.2em 0.6em;
  font-size: 0.9em;
  font-weight: 700;
  box-shadow: 0 1px 4px #0002;
}

.badge-bump {
  animation: bump 360ms ease-out;
}

@keyframes bump {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
</style>