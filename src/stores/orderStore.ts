import { map } from 'nanostores';

// --- TYPES ---
export type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type CustomItem = {
  description: string;
  quantity: number;
};

export type OrderEntry = {
  entryId: string; // unique per add
  type: 'product' | 'custom';
  productId?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
};

export type OrderStore = {
  entries: OrderEntry[];
};

// --- STORE ---
export const order = map<OrderStore>({
  entries: [],
});

// UI controls (panel open state)
export const ui = map<{ panelOpen: boolean }>({ panelOpen: false });

export function openPanel() {
  ui.setKey('panelOpen', true);
}

export function closePanel() {
  ui.setKey('panelOpen', false);
}

export function togglePanel() {
  ui.setKey('panelOpen', !(ui.get().panelOpen));
}

export function removeEntry(entryId: string) {
  const current = order.get().entries || [];
  const next = current.filter((e) => e.entryId !== entryId);
  order.setKey('entries', next);
  persistToStorage();
}

export function removeCustomItem(index: number) {
  const current = order.get().entries || [];
  // find Nth custom entry
  let found = -1;
  let count = 0;
  for (let i = 0; i < current.length; i++) {
    if (current[i].type === 'custom') {
      if (count === index) {
        found = i;
        break;
      }
      count++;
    }
  }
  if (found >= 0) {
    const next = [...current.slice(0, found), ...current.slice(found + 1)];
    order.setKey('entries', next);
    persistToStorage();
  }
}

export function mergeEntriesByProductId() {
  const current = order.get().entries || [];
  const productsMap: Record<string, OrderEntry> = {};
  const others: OrderEntry[] = [];

  for (const e of current) {
    if (e.type === 'product' && e.productId) {
      const key = e.productId;
      if (!productsMap[key]) {
        productsMap[key] = { ...e };
      } else {
        // sum quantities, keep unitPrice
        productsMap[key].quantity = (productsMap[key].quantity || 0) + (e.quantity || 0);
      }
    } else {
      others.push(e);
    }
  }

  const merged = [...Object.values(productsMap), ...others].map((it) => ({ ...it, entryId: `${it.entryId || 'm'}-${Math.random().toString(36).slice(2,6)}` }));
  order.setKey('entries', merged);
  persistToStorage();
}

// --- Persistence (localStorage) ---
const STORAGE_KEY = 'artesanias_order_v1';

function loadFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
  const parsed = JSON.parse(raw);
    // Validate shape lightly and set
    if (parsed && typeof parsed === 'object') {
      // migrate legacy shape -> entries
      if (Array.isArray(parsed.entries)) {
        order.set({ entries: parsed.entries });
      } else {
        const entries: any[] = [];
        if (parsed.cartItems && typeof parsed.cartItems === 'object') {
          for (const [k, v] of Object.entries(parsed.cartItems)) {
            entries.push({ entryId: `m-${k}`, type: 'product', productId: k, name: (v as any).name, quantity: (v as any).quantity, unitPrice: (v as any).unitPrice || (v as any).unitPrice });
          }
        }
        if (Array.isArray(parsed.customItems)) {
          for (const c of parsed.customItems) {
            entries.push({ entryId: `m-custom-${Math.random().toString(36).slice(2,6)}`, type: 'custom', name: c.description, quantity: c.quantity });
          }
        }
        order.set({ entries });
      }
    }
  } catch (e) {
    // ignore malformed storage
    console.warn('Could not load order from storage', e);
  }
}

function persistToStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order.get()));
  } catch (e) {
    console.warn('Could not persist order to storage', e);
  }
}

// initialize from storage on client
loadFromStorage();

// --- ACTIONS ---
export function addOrUpdateCartItem(item: CartItem) {
  if (item.quantity <= 0) return;
  const entry: OrderEntry = {
    entryId: `${item.productId || item.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'product',
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  };
  const current = order.get().entries || [];
  order.setKey('entries', [...current, entry]);
  persistToStorage();
}

export function setCustomItems(items: CustomItem[]) {
  const current = order.get().entries || [];
  const adds: OrderEntry[] = items.map((it) => ({
    entryId: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'custom',
    name: it.description,
    quantity: it.quantity,
  }));
  order.setKey('entries', [...current, ...adds]);
  persistToStorage();
}

export function clearOrder() {
  order.set({ entries: [] });
  persistToStorage();
}

// Small helper to get a snapshot (optional)
export function getOrderSnapshot() {
  return order.get();
}
// orderStore.ts
// ...