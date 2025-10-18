import assert from 'assert';
import { order, addOrUpdateCartItem, clearOrder, setCustomItems } from '../src/stores/orderStore.js';

async function run() {
  // clear
  clearOrder();
  // add item
  addOrUpdateCartItem({ id: 't1', name: 'Test', unitPrice: 100, quantity: 2 });
  const snap1 = order.get();
  assert(snap1.cartItems['t1'].quantity === 2, 'Item quantity should be 2');

  // update item
  addOrUpdateCartItem({ id: 't1', name: 'Test', unitPrice: 100, quantity: 3 });
  const snap2 = order.get();
  assert(snap2.cartItems['t1'].quantity === 3, 'Item quantity should be updated to 3');

  // custom items
  setCustomItems([{ description: 'Encargo', quantity: 1 }]);
  const snap3 = order.get();
  assert(snap3.customItems.length === 1, 'Should have one custom item');

  // clear
  clearOrder();
  const snap4 = order.get();
  assert(Object.keys(snap4.cartItems).length === 0 && snap4.customItems.length === 0, 'Order should be empty after clear');

  console.log('orderStore basic tests passed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
