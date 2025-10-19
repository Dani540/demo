<!-- ProductModal.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { addOrUpdateCartItem, type CartItem } from "../../stores/orderStore";

  let isOpen = false;
  let product: (CartItem & { description?: string }) | null = null;
  let selectedQuantity: number = 1;
  let minQuantity: number = 1;
  let galleryImages: string[] = [];
  let lastFocused: HTMLElement | null = null;
  let toast = "";
  let activeImageIndex = 0;

  onMount(() => {
    document.body.addEventListener("click", (e) => {
      const trigger = (e.target as HTMLElement).closest(".product-trigger");
      if (!trigger) return;
      e.preventDefault();
      const data = (trigger as HTMLElement).dataset;
      product = {
        productId: data.id || "default-id",
        name: data.name || "Sin Nombre",
        unitPrice: parseFloat(data.price || "0"),
        quantity: parseInt(data.minQuantity || "1"),
        // capture description if available
        description: data.description || "",
      };
      minQuantity = parseInt(data.minQuantity || "1");
      selectedQuantity = minQuantity;
      galleryImages = JSON.parse(data.images || "[]");
      activeImageIndex = 0;
      lastFocused = document.activeElement as HTMLElement | null;
      isOpen = true;
      // small timeout to focus inside modal
      setTimeout(() => focusFirst(), 0);
    });
  });

  function handleClose() {
    isOpen = false;
    product = null;
    if (lastFocused) lastFocused.focus();
  }

  function handleAddToCart() {
    if (!product) return;
    // create a cart item object expected by store
    addOrUpdateCartItem({
      productId: product.productId,
      name: product.name,
      quantity: selectedQuantity,
      unitPrice: product.unitPrice,
    });
    handleClose();
    showToast("Añadido al pedido");
  }

  function showToast(msg: string) {
    toast = msg;
    setTimeout(() => (toast = ""), 2000);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      handleClose();
    }
  }

  function focusFirst() {
    const modal = document.querySelector(
      ".modal-content",
    ) as HTMLElement | null;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) focusable[0].focus();
  }
</script>

{#if isOpen && product}
  <div class="modal-overlay" on:click={handleClose} role="presentation">
    <div
      class="modal-content"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      tabindex="0"
      on:click|stopPropagation
      on:keydown={onKeydown}
    >
      <button class="modal-close" on:click={handleClose}>×</button>
      <div class="panel">
        <div class="left">
          <div class="thumbs">
            {#each galleryImages as src, i}
              <button
                class:active={i === activeImageIndex}
                on:click={() => (activeImageIndex = i)}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <img {src} alt={`thumb ${i + 1}`} />
              </button>
            {/each}
          </div>
          <div class="main-image">
            {#if galleryImages.length > 0}
              <img src={galleryImages[activeImageIndex]} alt={product.name} />
            {/if}
          </div>
        </div>

        <div class="right">
          <h2>{product.name}</h2>
          <p class="desc">{(product as any).description}</p>

          <div class="meta">
            <div>Mínimo: <strong>{minQuantity}</strong></div>
            <div class="retail">
              Precio al detalle de referencia: <strong
                >${product.unitPrice}</strong
              >
            </div>
          </div>

          <label class="qty"
            >Cantidad:
            <input
              type="number"
              bind:value={selectedQuantity}
              min={minQuantity}
              max={500}
            />
          </label>

          <div class="actions">
            <button class="add-btn" on:click={handleAddToCart}>
              Añadir al Pedido (${product.unitPrice * selectedQuantity})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if toast}
  <div class="toast" role="status">{toast}</div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0007;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem; /* Añadido para que el modal no pegue en bordes móviles */
  }
  .modal-content {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem 2.5rem 1.5rem 2.5rem;
    width: 900px; /* Ancho máximo deseado */
    max-width: 95vw; /* Asegura que no se salga en móviles */
    max-height: 90vh; /* Límite de altura */
    display: flex; /* Añadido */
    flex-direction: column; /* Añadido */
    box-shadow: 0 4px 32px #0004;
    position: relative;
    text-align: left; /* Cambiado de 'center' */
    animation: fadeIn 0.2s ease-out; /* Animación de entrada */
  }
  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--primary);
    cursor: pointer;
    transition:
      transform 0.2s ease-out,
      color 0.2s ease-out; /* Juicy */
  }
  .modal-close:hover,
  .modal-close:focus {
    transform: scale(1.2);
    color: var(--accent);
  }
  .add-btn {
    margin-top: 1.5rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.7em 2em;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s ease-out; /* Juicy */
  }
  .add-btn:hover,
  .add-btn:focus {
    background: var(--accent);
    color: var(--primary);
    transform: scale(1.03);
    box-shadow: 0 2px 12px #0003;
  }
  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 0.6rem 1rem;
    border-radius: 999px;
    z-index: 2000;
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Panel layout */
  .panel {
    display: flex;
    gap: 1.5rem;
    align-items: stretch;
    overflow-y: auto; /* Permite scroll si el contenido es muy alto */
    padding-right: 0.5rem; /* Espacio para el scrollbar */
  }
  .left {
    flex: 1;
    display: flex;
    gap: 1rem;
  }
  .thumbs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 64px;
  }
  .thumbs button {
    background: none;
    border: 1px solid transparent;
    padding: 0.25rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease-out; /* Juicy */
  }
  .thumbs button.active {
    border-color: var(--primary);
    box-shadow: 0 2px 8px #0002;
    transform: scale(1.05);
  }
  .thumbs button:hover:not(.active),
  .thumbs button:focus {
    border-color: var(--accent);
    transform: scale(1.05);
  }
  .thumbs img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    display: block;
    border-radius: 0.25rem;
  }
  .main-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdfcfb;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow: hidden; /* Asegura que la imagen no se desborde */
  }
  .main-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    /* --- ESTA ES LA REGLA CLAVE --- */
    max-height: 65vh; /* Límite de altura: 65% de la pantalla */
  }
  .right {
    width: 360px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .desc {
    color: #5b3f2a;
    text-align: left;
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #3b2a1f;
    text-align: left;
  }
  .retail {
    color: #8a6b52;
  }
  .qty {
    text-align: left;
  }
  .qty input {
    width: 100px;
    padding: 0.4rem;
    border-radius: 0.4rem;
    border: 1px solid #ddd;
  }
  .actions {
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .panel {
      flex-direction: column;
    }
    .right {
      width: 100%;
    }
    .thumbs {
      flex-direction: row;
      width: auto;
    }
    .thumbs img {
      width: 40px;
      height: 40px;
    }
    .main-image img {
      max-height: 50vh; /* Un poco menos en móvil */
    }
  }
</style>
