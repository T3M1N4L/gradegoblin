import type { APIRoute } from 'astro'
import { districtLookup } from '$lib/svue'

export const GET: APIRoute = async ({ params }) => {
	const zip = String(params.zip ?? '').trim()
	if (!/^\d{5}$/.test(zip)) {
		return new Response(JSON.stringify({ error: 'Invalid ZIP format. Expect 5 digits.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		})
	}

	try {
		const districts = await districtLookup(zip)
		return new Response(
			JSON.stringify({
				zip,
				count: districts.length,
				districts: districts.map((district) => ({
					name: district.name,
					url: district.host.replace(/\/$/, ''),
					address: district.address,
					zipcode: district.zipcode
				})),
				source: 'remote'
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800'
				}
			}
		)
	} catch (error) {
		console.error('[/api/districts/[zip]]', error)
		return new Response(JSON.stringify({ error: 'District lookup failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		})
	}
}
