<script lang="ts">
	import { setCustomItems, addOrUpdateCartItem } from '../../stores/orderStore';
	// --- CORREGIDO: Importar desde products.ts (usando el alias) ---
	import products from '@/content/products/products.ts';

	type CustomItem = { productId: string;
productName: string; quantity: number };

		// Start with two rows: first preselected, second empty
		let fields: CustomItem[] = [
			{ productId: products[0]?.id ||
'', productName: products[0]?.name || '', quantity: 1 },
			{ productId: '', productName: '', quantity: 1 },
		];
function handleInput(index: number) {
			// if last row has a selection, append a new empty row
			if (index === fields.length - 1 && fields[index].productId) {
				fields = [...fields, { productId: '', productName: '', quantity: 1 }];
}
		}

		function handleProductChange(index: number, id: string) {
			const p = products.find((x) => x.id === id);
			fields[index].productId = id;
			fields[index].productName = p?.name ||
'';
			// After changing product, maybe add a new empty row
			handleInput(index);
}

	function handleSubmit() {
		const selected = fields.filter((f) => f.productId && f.quantity > 0);
for (const f of selected) {
			const p = products.find((x) => x.id === f.productId);
            // 'price' sigue estando disponible en nuestro 'products.ts'
addOrUpdateCartItem({ productId: f.productId, name: f.productName, quantity: f.quantity, unitPrice: p?.price ?? 0 });
		}
		window.location.href = '/pedido';
}
</script>

<form on:submit|preventDefault={handleSubmit} class="encargo-form">
	<h3>Pedido</h3>

	{#each fields as field, i}
		<div class="encargo-field">
					<select bind:value={field.productId} on:change={(e) => handleProductChange(i, (e.currentTarget as HTMLSelectElement).value)}>
						<option value="">Seleccionar producto...</option>
						{#each products as p}
							<option value={p.id}>{p.name}</option>
						{/each}
					</select>

			<input type="number" min="1" max="500" bind:value={field.quantity} />
		</div>
	{/each}

	<button type="submit" class="primary">Añadir y Ver Pedido</button>

	<style>
		.encargo-form { display: grid;
gap: 0.75rem; }
		.encargo-field { display:flex; gap:0.5rem; }
		select { flex: 1; padding:0.5rem; border-radius:0.5rem; border:1px solid #ddd }
		input[type="number"] { width:100px; padding:0.4rem; border-radius:0.4rem;
border:1px solid #ddd }
		.primary { background:var(--primary); color:#fff; padding:0.6rem 1rem; border-radius:0.6rem; border:none }
	</style>
</form>