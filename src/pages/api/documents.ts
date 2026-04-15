import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
	}

	try {
		const client = await getAuthedClient(locals)
		const documents = await client.getDocuments()

		return new Response(JSON.stringify(documents), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('[/api/documents]', error)
		return new Response(JSON.stringify({ error: 'Failed to fetch documents' }), { status: 500 })
	}
}
