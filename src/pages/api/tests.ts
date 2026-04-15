import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
	}

	try {
		const client = await getAuthedClient(locals)
		const tests = await client.getTests()

		return new Response(JSON.stringify(tests ?? { analysis: { availableTests: [] } }), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('[/api/tests]', error)
		return new Response(JSON.stringify({ error: 'Failed to fetch tests' }), { status: 500 })
	}
}
