import { login } from '$lib/svue'
import { getDemoClient, isDemoDistrictUrl } from '$lib/server/demoStudent'

function decodeBase64(value: string) {
	return Buffer.from(value, 'base64').toString('utf8')
}

export async function getAuthedClient(locals: App.Locals) {
	if (!locals.user) {
		throw new Error('Unauthorized')
	}

	if (isDemoDistrictUrl(decodeBase64(locals.user.districtUrl))) {
		return getDemoClient()
	}

	return login(
		decodeBase64(locals.user.districtUrl),
		decodeBase64(locals.user.username),
		decodeBase64(locals.user.password)
	)
}
