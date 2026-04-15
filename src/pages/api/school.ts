import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
	}

	try {
		const client = await getAuthedClient(locals)
		const school = await client.getSchoolInfo()

		return new Response(JSON.stringify(school), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('[/api/school]', error)
		return new Response(JSON.stringify({ error: 'Failed to fetch school info' }), { status: 500 })
	}
}
