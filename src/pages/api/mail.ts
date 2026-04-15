import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
	}

	try {
		const client = await getAuthedClient(locals)
		const mail = await client.getMail()

		return new Response(JSON.stringify(mail), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('[/api/mail]', error)
		return new Response(JSON.stringify({ error: 'Failed to fetch mail' }), { status: 500 })
	}
}
