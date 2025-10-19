<!-- CartIcon.svelte -->
<script lang="ts">
import { order, togglePanel } from '../../stores/orderStore';
import cartIconSvg from "@/assets/caja_carton.svg?raw";

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
  <div class="icon-wrapper" aria-hidden="true">
    {@html cartIconSvg}
  </div>
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
    cursor: pointer;
    
    /* Añadidos para centrar el wrapper y la badge */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0; /* Asegúrate de que no tenga padding interno */
    border: none; /* Quita bordes del botón */
    background: none; /* Quita fondo del botón */
  }

  .icon-wrapper {
    width: 1.5em; 
    height: 1.5em;
    display: inline-block; /* <-- CAMBIO CLAVE */
    vertical-align: middle; /* Ayuda a alinearlo */
    line-height: 0; /* Quita espacio extra */
  }

  /* 2. La regla clave que faltaba */
  /* Le dice al SVG inyectado que se ajuste al 100% del .icon-wrapper */
  .icon-wrapper :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .icon-wrapper:hover {
    cursor: pointer;
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;
  }

  .cart-badge {
    position: absolute;
    top: 62%;
    right: -6px;
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
    0% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.25);
    }
    60% {
      transform: scale(0.98);
    }
    100% {
      transform: scale(1);
    }
  }
</style>