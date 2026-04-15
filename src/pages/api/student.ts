import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
	}

	try {
		const client = await getAuthedClient(locals)
		const student = await client.getStudentInfo()

		return new Response(JSON.stringify(student), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('[/api/student]', error)
		return new Response(JSON.stringify({ error: 'Failed to fetch student info' }), { status: 500 })
	}
}
