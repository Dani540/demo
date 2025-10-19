<!-- PedidoForm.svelte -->
<script lang="ts">
	import {
		order,
		clearOrder,
		removeEntry,
		type OrderStore,
	} from "../../stores/orderStore";

	// Svelte auto-subscription
	$: entries = $order.entries || [];
	// total uses metadata quantity*unitPrice
	$: total = entries.reduce(
		(acc, e) => acc + (e.unitPrice || 0) * e.quantity,
		0,
	);

	let customerData = { name: "", email: "", phone: "", rut: "", address: "" };
	let isLoading = false;
	let error = "";

	async function handleSendOrder() {
		isLoading = true;
		error = "";
		const finalOrder = { customer: customerData, order: $order };
		try {
			const res = await fetch("/api/create-order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(finalOrder),
			});
			if (!res.ok) throw new Error("Error en el servidor");
			clearOrder();
			window.location.href = "/gracias";
		} catch (e) {
			error = "No pudimos enviar tu pedido. Intenta de nuevo.";
			console.log(e);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="pedido-container">
	<h2>Resumen de tu Pedido</h2>
	<div class="disclaimer">
		<strong>Importante:</strong> Esto NO es un pago.
	</div>

	<h4>Items</h4>
	<ul class="items-list">
		{#each entries as e}
			<li class="item-row">
				<div><strong>1 ×</strong> {e.name}</div>
				<div style="display:flex;gap:0.5rem;align-items:center;">
					<span class="price"
						>${((e.unitPrice || 0) * e.quantity).toFixed(2)}</span
					><button
						class="remove"
						on:click={() => removeEntry(e.entryId)}>Eliminar</button
					>
				</div>
			</li>
		{/each}
		{#if entries.length === 0}
			<li class="empty">No hay productos en tu pedido.</li>
		{/if}
	</ul>

	<hr />
	<h3>Total Estimado (Sin envío): ${total}</h3>
	<div style="display:flex;gap:0.5rem;">
		<button type="button" class="secondary" on:click={clearOrder}
			>Vaciar pedido</button
		>
	</div>

	<form on:submit|preventDefault={handleSendOrder} class="pedido-form">
		<h3>Tus Datos</h3>
		<input
			type="text"
			placeholder="Nombre Completo"
			bind:value={customerData.name}
			required
		/>
		<input
			type="email"
			placeholder="Email"
			bind:value={customerData.email}
			required
		/>
		<input
			type="tel"
			placeholder="Número WhatsApp (ej. +569...)"
			bind:value={customerData.phone}
			required
		/>
		<input
			type="text"
			placeholder="RUT"
			bind:value={customerData.rut}
		/>
		<input
			type="text"
			placeholder="Dirección (Para envío)"
			bind:value={customerData.address}
			required
		/>

		<button type="submit" class="primary" disabled={isLoading}
			>{isLoading ? "Enviando..." : "Realizar Pedido"}</button
		>
		{#if error}<p class="error">{error}</p>{/if}
	</form>

	<style>
		.pedido-container {
			display: grid;
			gap: 1rem;
		}
		.disclaimer {
			background: #fff8f2;
			padding: 0.6rem;
			border-radius: 0.5rem;
			border: 1px solid #f0e0d6;
		}
		.items-list {
			list-style: none;
			padding: 0;
			margin: 0;
			display: grid;
			gap: 0.4rem;
		}
		.item-row {
			background: #fff;
			padding: 0.6rem;
			border-radius: 0.5rem;
			border: 1px solid #efe6df;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.price {
			color: var(--accent);
			font-weight: 600;
		}
		.empty {
			color: #6b5a50;
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
		.secondary:hover,
		.secondary:focus {
			background: rgba(124, 77, 42, 0.06);
			cursor: pointer;
		}
		.pedido-form {
			display: grid;
			gap: 0.5rem;
			max-width: 520px;
			margin-top: 0.5rem;
		}
		input,
		select,
		textarea {
			width: 100%;
			padding: 0.6rem 0.75rem;
			border-radius: 0.6rem;
			border: 1px solid #e6dfd8;
		}
		.primary {
			background: var(--primary);
			color: #fff;
			border: none;
			padding: 0.6rem 1rem;
			border-radius: 0.6rem;
			cursor: pointer;
		}
		.secondary {
			background: transparent;
			color: var(--primary);
			border: 1px solid var(--primary);
			padding: 0.5rem 0.8rem;
			border-radius: 0.6rem;
		}
		.error {
			color: #b00020;
		}
	</style>
</div>
