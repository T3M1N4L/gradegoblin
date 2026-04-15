import type { APIRoute } from 'astro'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const periodIndex = parseInt(params.index ?? '0')
  if (isNaN(periodIndex) || periodIndex < 0) {
    return new Response(JSON.stringify({ error: 'Invalid index' }), { status: 400 })
  }

  try {
    const client = await getAuthedClient(locals)

    const gradebook = await client.getGradebook(periodIndex)

    if (!gradebook) {
      return new Response(JSON.stringify({ error: 'Missing gradebook data' }), { status: 404 })
    }

    return new Response(JSON.stringify({ gradebook }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[/api/period/[index]]', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch period' }), { status: 500 })
  }
}
