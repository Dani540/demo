// src/pages/api/create-order.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import type { OrderStore } from '../../stores/orderStore';

// 1. FIX ASTRO WARNING: Desactiva el prerenderizado estático para que el endpoint funcione.
export const prerender = false;

// Read env vars (configure in .env)
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || null;
const SECOND_ADMIN_EMAIL = import.meta.env.SECOND_ADMIN_EMAIL || null;

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
	let body: OrderPayload;
	
	try {
		// 2. FIX JSON ERROR: Intenta leer el cuerpo de la solicitud.
		body = (await request.json()) as OrderPayload;
	} catch (e) {
		// Captura el SyntaxError de JSON (cuerpo vacío/malformado)
		console.error('JSON Parsing Error:', e);
		return new Response(JSON.stringify({ message: 'Error en el formato de la solicitud (JSON no válido o cuerpo vacío)' }), { status: 400 });
	}

	try {
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
		`;

		const emails: string[] = [ADMIN_EMAIL, SECOND_ADMIN_EMAIL];

		const res = await resend.emails.send({
			// 3. FIX RESEND: Usa el email de administración como remitente.
			from: `Artesanías Pedidos <onboarding@resend.dev>`,
			to: ADMIN_EMAIL,
			subject: `¡Nuevo pedido de ${customer.name}!`,
			html: emailHtml,
		});

	return new Response(JSON.stringify({ message: 'Pedido enviado con éxito', id: (res as any)?.data?.id ?? null }), { status: 200 });
	} catch (e) {
		console.error('API processing error:', e);
		return new Response(JSON.stringify({ message: 'Error interno del servidor al procesar el pedido o enviar el email' }), { status: 500 });
	}
};