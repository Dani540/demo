import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import type { OrderStore } from '../../stores/orderStore';

// Read env vars (configure in .env)
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || 'tu-email-de-admin@example.com';

const resend = new Resend(RESEND_API_KEY);

type OrderPayload = {
	customer: {
		name: string;
		email: string;
		phone: string;
		rut?: string;
		address?: string;
	};
	order: OrderStore;
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as OrderPayload;
		const { customer, order } = body;

		if (!customer.name || !customer.email || !customer.phone) {
			return new Response(JSON.stringify({ message: 'Faltan datos del cliente' }), { status: 400 });
		}

			const entries = order.entries || [];
			const cartItemsHtml = entries
				.filter((e) => e.type === 'product')
				.map((item) => `<li>${item.quantity} x ${item.name} (@ $${item.unitPrice} c/u)</li>`)
				.join('');

			const customItemsHtml = entries
				.filter((e) => e.type === 'custom')
				.map((item) => `<li>${item.quantity} x ${item.name}</li>`)
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

		const res = await resend.emails.send({
			from: `Pedidos Web <pedidos@${ADMIN_EMAIL.replace(/.*@/, '')}>`,
			to: ADMIN_EMAIL,
			subject: `¡Nuevo pedido de ${customer.name}!`,
			html: emailHtml,
		});

	return new Response(JSON.stringify({ message: 'Pedido enviado con éxito', id: (res as any)?.data?.id ?? null }), { status: 200 });
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ message: 'Error interno del servidor' }), { status: 500 });
	}
};