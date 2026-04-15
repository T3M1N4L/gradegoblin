import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals, params }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
	}

	if (!params.documentGU) {
		return new Response(JSON.stringify({ error: 'Missing document id' }), { status: 400 })
	}

	try {
		const client = await getAuthedClient(locals)
		const document = await client.getDocument(params.documentGU)
		return new Response(JSON.stringify(document ?? {}), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
	} catch (error) {
		console.error('[/api/documents/:documentGU]', error)
		return new Response(JSON.stringify({ error: 'Failed to fetch document' }), { status: 500 })
	}
}
