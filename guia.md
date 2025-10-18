Guía de desarrollo completa, detallando el sistema, la arquitectura de componentes (estáticos y reactivos) y las interacciones de usuario.

-----

# Guía de Desarrollo: E-commerce de Artesanías (Astro)

Este documento describe la arquitectura técnica y el flujo de componentes para un sitio de e-commerce enfocado en la **generación de pedidos** (cotizaciones), sin procesamiento de pagos en línea.

  * **Framework:** Astro
  * **Islas Reactivas:** Svelte (Recomendado por ligereza, pero la lógica es aplicable a React/Vue)
  * **Gestión de Estado:** Nanostores
  * **Backend (Notificaciones):** Astro API Routes + Resend (para email)

-----

## 1\. Arquitectura del Sistema (El Núcleo)

El sistema se basa en un **estado global (Store)** que persiste en el cliente mientras navega. Este *store* es el único "carrito" y acumula productos de dos fuentes distintas: el catálogo (`/`) y el formulario de encargos (`/encargo`).

### 1.1. El Estado Global (Nanostores)

Este es el cerebro de la aplicación. Define la estructura de datos del pedido completo.

**Archivo: `/src/stores/orderStore.ts`**

```typescript
import { map } from 'nanostores';

// --- TIPOS DE DATOS ---

/**
 * Representa un ítem añadido desde el catálogo (ProductModal).
 * Usamos un Record (objeto) para fácil acceso y para evitar duplicados.
 */
export type CartItem = {
  id: string;        // ID del producto
  name: string;      // Nombre del producto
  quantity: number;  // Cantidad seleccionada
  unitPrice: number; // Precio mayorista
  // Añadir más campos si es necesario (ej. SKU, thumbnail)
};

/**
 * Representa un ítem del formulario de encargo especial.
 * Es una lista simple, ya que no tienen ID.
 */
export type CustomItem = {
  description: string; // "Mesa de roble 2x1m"
  quantity: number;    // "1"
};

/**
 * Define la estructura completa de nuestro store.
 */
export type OrderStore = {
  cartItems: Record<string, CartItem>; // Clave: Product ID
  customItems: CustomItem[];
};

// --- INICIALIZACIÓN DEL STORE ---

export const $order = map<OrderStore>({
  cartItems: {},
  customItems: [],
});

// --- ACCIONES (Mutaciones del Store) ---

/**
 * Añade o actualiza un ítem en el carrito del catálogo.
 * Si la cantidad es 0, se elimina.
 */
export function addOrUpdateCartItem(item: CartItem) {
  if (item.quantity <= 0) {
    // Elimina el ítem si la cantidad es 0
    const currentItems = $order.get().cartItems;
    delete currentItems[item.id];
    $order.setKey('cartItems', { ...currentItems });
  } else {
    // Añade o actualiza el ítem
    $order.setKey('cartItems', {
      ...$order.get().cartItems,
      [item.id]: item,
    });
  }
}

/**
 * Sobrescribe por completo la lista de encargos especiales.
 * Esto se llama al enviar el formulario de /encargo.
 */
export function setCustomItems(items: CustomItem[]) {
  $order.setKey('customItems', items);
}

/**
 * Limpia todo el pedido.
 * Se llama después de que el pedido se envía con éxito.
 */
export function clearOrder() {
  $order.set({
    cartItems: {},
    customItems: [],
  });
}
```

-----

## 2\. Arquitectura de Componentes

Dividimos los componentes en dos tipos: Estáticos (Astro) y Reactivos (Svelte/React).

### 2.1. Componentes Estáticos (.astro)

Estos componentes no tienen estado en el cliente. Son HTML y CSS puros.

#### `src/layouts/Layout.astro`

  * **Descripción:** Plantilla base de toda la página.
  * **Implementación:**
      * Incluye el `<head>` (metatags, fuentes, CSS global).
      * Renderiza `<Header.astro />` en la parte superior.
      * Renderiza el `<slot />` para el contenido de la página.
      * Renderiza `<Footer.astro />` en la parte inferior.
      * **Importante:** Renderiza la isla del modal *una sola vez* aquí, para que esté disponible globalmente: `<ProductModal client:visible />`.

#### `src/components/Header.astro`

  * **Descripción:** Barra de navegación superior.
  * **Implementación:**
      * Logo (link a `/`).
      * Enlace "Hacer Encargo" (link a `/encargo`).
      * Renderiza la isla del ícono de carrito: `<CartIcon client:load />`. `client:load` es vital para que se actualice desde cualquier página.

#### `src/components/ProductCatalog.astro`

  * **Descripción:** Renderiza la cuadrícula de todos los productos en la Home.
  * **Implementación:**
      * Obtiene los datos de los productos (ej. `Astro.glob('../content/products/*.md')` o un fetch a un JSON local).
      * Inicia un bucle `.map()` sobre los productos.
      * Por cada producto, renderiza un `<ProductCard.astro />`.

#### `src/components/ProductCard.astro`

  * **Descripción:** La tarjeta individual de producto en el catálogo. **Este es un componente estático clave.**
  * **Implementación:**
      * No es una isla. Es 100% HTML.
      * Muestra la imagen principal, título, precio unitario y precio por cantidad mínima.
      * **Interacción (Clave):** Todo el componente (o un botón "Ver Detalles") debe estar envuelto en un tag (`<button>` o `<a>`) con la clase `class="product-trigger"`.
      * Debe contener **data-attributes** que el `ProductModal` leerá:
        ```html
        <div class="product-trigger"
             data-id={product.id}
             data-name={product.name}
             data-description={product.description}
             data-price={product.price}
             data-images={JSON.stringify(product.galleryImages)}
             data-min-quantity={product.minQuantity}
             tabindex="0"
             role="button"
        >
          </div>
        ```

### 2.2. Componentes Reactivos (Islas - Svelte)

Estos componentes manejan la lógica del cliente y el estado.

#### `src/components/islands/CartIcon.svelte`

  * **Directiva Astro:** `client:load`
  * **Propósito:** Muestra el número total de ítems en el pedido.
  * **Implementación:**
    ```svelte
    <script lang="ts">
      import { useStore } from '@nanostores/svelte';
      import { $order, type OrderStore } from '../../stores/orderStore';

      // Suscripción reactiva al store
      const order = useStore($order);

      // Variable computada
      $: totalItems = ($order: OrderStore) => {
        const cartCount = Object.keys($order.cartItems).length;
        const customCount = $order.customItems.length;
        return cartCount + customCount;
      }($order);
    </script>

    <a href="/pedido" class="cart-icon">
      🛒
      {#if totalItems > 0}
        <span class="cart-badge">{totalItems}</span>
      {/if}
    </a>
    ```

#### `src/components/islands/ProductModal.svelte`

  * **Directiva Astro:** `client:visible` (Renderizado en `Layout.astro`).
  * **Propósito:** Modal global que se activa al hacer clic en `ProductCard`.
  * **Implementación:**
    ```svelte
    <script lang="ts">
      import { onMount } from 'svelte';
      import { addOrUpdateCartItem, type CartItem } from '../../stores/orderStore';

      let isOpen = false;
      let product: CartItem | null = null;
      let selectedQuantity: number = 1;
      let galleryImages: string[] = [];

      onMount(() => {
        // Escucha clics en *cualquier* tarjeta de producto
        document.body.addEventListener('click', (e) => {
          const trigger = (e.target as HTMLElement).closest('.product-trigger');
          if (!trigger) return;

          e.preventDefault();
          const data = (trigger as HTMLElement).dataset;
          
          product = {
            id: data.id || 'default-id',
            name: data.name || 'Sin Nombre',
            unitPrice: parseFloat(data.price || '0'),
            quantity: parseInt(data.minQuantity || '1'), // Inicia con la cantidad mínima
            // ... otros campos
          };
          
          selectedQuantity = product.quantity;
          galleryImages = JSON.parse(data.images || '[]');
          isOpen = true;
        });
      });

      function handleClose() {
        isOpen = false;
        product = null;
      }

      function handleAddToCart() {
        if (!product) return;
        
        addOrUpdateCartItem({
          ...product,
          quantity: selectedQuantity
        });
        
        handleClose();
        // Opcional: Mostrar una notificación "¡Añadido!"
      }
    </script>

    {#if isOpen && product}
      <div class="modal-overlay" on:click={handleClose}>
        <div class="modal-content" on:click|stopPropagation>
          <button class="modal-close" on:click={handleClose}>X</button>
          
          <h2>{product.name}</h2>
          <label>
            Cantidad (Mín. {product.minQuantity}):
            <input type="number" bind:value={selectedQuantity} min={product.minQuantity} />
          </label>

          <button on:click={handleAddToCart}>
            Añadir al Pedido (${product.unitPrice * selectedQuantity})
          </button>
        </div>
      </div>
    {/if}

    <style>
      /* ... Estilos de CSS para el modal ... */
    </style>
    ```

#### `src/components/islands/EncargoForm.svelte`

  * **Directiva Astro:** `client:load` (Usado en `/src/pages/encargo.astro`).
  * **Propósito:** Formulario dinámico para añadir encargos especiales.
  * **Implementación:**
    ```svelte
    <script lang="ts">
      import { setCustomItems, type CustomItem } from '../../stores/orderStore';

      let fields: CustomItem[] = [{ description: '', quantity: 1 }];

      function handleInput(index: number) {
        // Si el usuario escribe en el último campo, añade uno nuevo
        if (index === fields.length - 1 && fields[index].description.trim() !== '') {
          fields = [...fields, { description: '', quantity: 1 }];
        }
      }

      function handleSubmit() {
        // Filtra los campos vacíos antes de guardar
        const finalItems = fields.filter(f => f.description.trim() !== '');
        setCustomItems(finalItems);
        
        // Redirige a la página de pedido
        window.location.href = '/pedido';
      }
    </script>

    <form on:submit|preventDefault={handleSubmit}>
      <h3>Encargos Especiales</h3>
      {#each fields as field, i (i)}
        <div class="encargo-field">
          <input 
            type="text" 
            placeholder="Descripción del producto (ej. Mesa de roble 2x1m)"
            bind:value={field.description}
            on:input={() => handleInput(i)}
          />
          <input 
            type="number" 
            min="1"
            bind:value={field.quantity}
          />
        </div>
      {/each}
      
      <button type="submit">Añadir y Ver Pedido</button>
    </form>
    ```

#### `src/components/islands/PedidoForm.svelte`

  * **Directiva Astro:** `client:load` (Usado en `/src/pages/pedido.astro`).
  * **Propósito:** Muestra el resumen del pedido y recopila los datos del cliente.
  * **Implementación:**
    ```svelte
    <script lang="ts">
      import { useStore } from '@nanostores/svelte';
      import { $order, clearOrder, type OrderStore } from '../../stores/orderStore';

      const order = useStore($order);

      let customerData = {
        name: '',
        email: '',
        phone: '',
        rut: '',
        address: '',
      };

      let isLoading = false;
      let error = '';

      // Variables computadas para el resumen
      $: cartItemsList = Object.values($order.cartItems);
      $: customItemsList = $order.customItems;
      $: total = cartItemsList.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

      async function handleSendOrder() {
        isLoading = true;
        error = '';

        const finalOrder = {
          customer: customerData,
          order: $order.get() // Envía el estado actual del store
        };

        try {
          const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalOrder)
          });

          if (!response.ok) throw new Error('Error en el servidor');

          // Éxito
          clearOrder(); // Limpia el carrito
          window.location.href = '/gracias'; // Redirige

        } catch (e) {
          error = 'No pudimos enviar tu pedido. Intenta de nuevo.';
        } finally {
          isLoading = false;
        }
      }
    </script>

    <div class="pedido-container">
      <h2>Resumen de tu Pedido</h2>
      
      <div class="disclaimer">
        <strong>Importante:</strong> Esto NO es un pago. Al hacer clic en "Realizar Pedido", 
        nos enviarás tu solicitud. Te contactaremos por WhatsApp para coordinar 
        el pago (transferencia) y los detalles del envío.
      </div>

      <h4>Productos del Catálogo</h4>
      <ul>
        {#each cartItemsList as item}
          <li>{item.quantity} x {item.name} - (${item.unitPrice} c/u)</li>
        {/each}
        {#if cartItemsList.length === 0}
          <li>No hay productos del catálogo.</li>
        {/if}
      </ul>

      <h4>Encargos Especiales</h4>
      <ul>
        {#each customItemsList as item}
          <li>{item.quantity} x {item.description}</li>
        {/each}
        {#if customItemsList.length === 0}
          <li>No hay encargos especiales.</li>
        {/if}
      </ul>

      <hr />
      <h3>Total Estimado (Sin envío): ${total}</h3>

      <form on:submit|preventDefault={handleSendOrder}>
        <h3>Tus Datos</h3>
        <input type="text" placeholder="Nombre Completo" bind:value={customerData.name} required />
        <input type="email" placeholder="Email" bind:value={customerData.email} required />
        <input type="tel" placeholder="Número WhatsApp (ej. +569...)" bind:value={customerData.phone} required />
        <input type="text" placeholder="RUT (Para boleta/factura)" bind:value={customerData.rut} />
        <input type="text" placeholder="Dirección (Para envío)" bind:value={customerData.address} required />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Realizar Pedido'}
        </button>
        {#if error}<p class="error">{error}</p>{/if}
      </form>
    </div>
    ```

-----

## 3\. Páginas y Rutas

Así se conectan los componentes para formar las páginas.

#### `src/pages/index.astro` (Home)

  * **Ruta:** `/`
  * **Contenido:**
    ```astro
    <Layout title="Inicio | Artesanías">
      <ProductCatalog />
      </Layout>
    ```

#### `src/pages/encargo.astro`

  * **Ruta:** `/encargo`
  * **Contenido:**
    ```astro
    <Layout title="Haz tu Encargo">
      <h1>Encargos Especiales</h1>
      <p>Describe el producto que buscas y lo cotizaremos para ti.</p>
      <EncargoForm client:load />
    </Layout>
    ```

#### `src/pages/pedido.astro`

  * **Ruta:** `/pedido`
  * **Contenido:**
    ```astro
    <Layout title="Finalizar Pedido">
      <PedidoForm client:load />
    </Layout>
    ```

#### `src/pages/gracias.astro`

  * **Ruta:** `/gracias`
  * **Contenido:** Página estática.
    ```astro
    <Layout title="¡Pedido Recibido!">
      <h1>¡Gracias por tu pedido!</h1>
      <p>Hemos recibido tu solicitud.</p>
      <p>Nos pondremos en contacto contigo vía <strong>WhatsApp</strong> o <strong>email</strong> a la brevedad para confirmar los detalles, el pago y el envío.</p>
    </Layout>
    ```

-----

## 4\. Backend: API de Notificación

Este *endpoint* recibe los datos del `PedidoForm` y te envía un email.

**Archivo: `/src/pages/api/create-order.ts`**

  * **Tecnología:** [Resend](https://resend.com/) (requiere una API Key).
  * **Instalación:** `npm install resend`
  * **Variables de Entorno (`.env`):** `RESEND_API_KEY=tu_api_key_secreta`

<!-- end list -->

```typescript
// src/pages/api/create-order.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import type { OrderStore } from '../../stores/orderStore'; // Importa tus tipos

// Asegúrate de que la variable de entorno está cargada
const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Tipo para el payload que esperamos
type OrderPayload = {
  customer: {
    name: string;
    email: string;
    phone: string;
    rut: string;
    address: string;
  };
  order: OrderStore;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as OrderPayload;
    const { customer, order } = body;

    // --- Validación Simple (Usar Zod para producción) ---
    if (!customer.name || !customer.email || !customer.phone) {
      return new Response(JSON.stringify({ message: 'Faltan datos del cliente' }), {
        status: 400,
      });
    }

    // --- Construir el Email (en HTML) ---
    const cartItemsHtml = Object.values(order.cartItems)
      .map(
        (item) => `<li>${item.quantity} x ${item.name} (@ $${item.unitPrice} c/u)</li>`
      )
      .join('');
      
    const customItemsHtml = order.customItems
      .map((item) => `<li>${item.quantity} x ${item.description}</li>`)
      .join('');

    const emailHtml = `
      <h1>Nuevo Pedido de ${customer.name}</h1>
      <p>Has recibido un nuevo pedido desde la web.</p>
      
      <h2>Datos de Contacto:</h2>
      <ul>
        <li><strong>Nombre:</strong> ${customer.name}</li>
        <li><strong>Email:</strong> ${customer.email}</li>
        <li><strong>WhatsApp:</strong> ${customer.phone}</li>
        <li><strong>RUT:</strong> ${customer.rut || 'No ingresado'}</li>
        <li><strong>Dirección:</strong> ${customer.address || 'No ingresada'}</li>
      </ul>
      
      <h2>Detalle del Pedido:</h2>
      
      <h3>Productos del Catálogo:</h3>
      <ul>${cartItemsHtml || '<li>Ninguno</li>'}</ul>
      
      <h3>Encargos Especiales:</h3>
      <ul>${customItemsHtml || '<li>Ninguno</li>'}</ul>
    `;

    // --- Enviar con Resend ---
    const { data, error } = await resend.emails.send({
      from: 'Pedidos Web <pedidos@tu-dominio.com>', // Configura tu dominio en Resend
      to: 'tu-email-de-admin@gmail.com', // ¡Tu email!
      subject: `¡Nuevo pedido de ${customer.name}!`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error de Resend:', error);
      throw new Error('Error al enviar el email');
    }

    // --- Respuesta Exitosa ---
    return new Response(JSON.stringify({ message: 'Pedido enviado con éxito', id: data?.id }), {
      status: 200,
    });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
      status: 500,
    });
  }
};
```

-----

## 5\. Estructura de Archivos (Resumen)

```
/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ProductCatalog.astro
│   │   ├── ProductCard.astro
│   │   └── islands/
│   │       ├── CartIcon.svelte
│   │       ├── ProductModal.svelte
│   │       ├── EncargoForm.svelte
│   │       └── PedidoForm.svelte
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── encargo.astro
│   │   ├── pedido.astro
│   │   ├── gracias.astro
│   │   └── api/
│   │       └── create-order.ts
│   │
│   ├── stores/
│   │   └── orderStore.ts   <-- (El cerebro)
│   │
│   └── content/ (Opcional)
│       └── products/
│           ├── producto-1.md
│           └── producto-2.md
│
├── public/
│   └── (Imágenes, favicons)
│
└── astro.config.mjs
```