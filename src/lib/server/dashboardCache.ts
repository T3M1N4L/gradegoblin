const CACHE_TTL_MS = 2 * 60 * 1000

type DashboardSnapshot = {
	student: any
	periodDates: any[]
	totalPeriods: number
	currentPeriod: number
	periods: (any | null)[]
	expiresAt: number
}

const dashboardCache = new Map<string, DashboardSnapshot>()
const dashboardPending = new Map<string, Promise<DashboardSnapshot>>()
const periodPending = new Map<string, Promise<any>>()

export function getDashboardCacheKey(
	user: Pick<App.Locals['user'], 'username' | 'password' | 'districtUrl'>
) {
	return `${user.username}:${user.password}:${user.districtUrl}`
}

export function readDashboardCache(key: string) {
	const snapshot = dashboardCache.get(key)
	if (!snapshot) return null

	if (snapshot.expiresAt <= Date.now()) {
		dashboardCache.delete(key)
		return null
	}

	return {
		...snapshot,
		periods: [...snapshot.periods]
	}
}

export function writeDashboardCache(
	key: string,
	snapshot: Omit<DashboardSnapshot, 'expiresAt'>
) {
	const cached = {
		...snapshot,
		periods: [...snapshot.periods],
		expiresAt: Date.now() + CACHE_TTL_MS
	}
	dashboardCache.set(key, cached)
	return {
		...cached,
		periods: [...cached.periods]
	}
}

export function clearDashboardCache(key: string) {
	dashboardCache.delete(key)
	dashboardPending.delete(key)
	for (const pendingKey of periodPending.keys()) {
		if (pendingKey.startsWith(`${key}:`)) periodPending.delete(pendingKey)
	}
}

export function readDashboardPending(key: string) {
	return dashboardPending.get(key) ?? null
}

export function writeDashboardPending(key: string, promise: Promise<DashboardSnapshot>) {
	dashboardPending.set(key, promise)
	return promise
}

export function clearDashboardPending(key: string) {
	dashboardPending.delete(key)
}

export function readPeriodPending(key: string, period: number) {
	return periodPending.get(`${key}:${period}`) ?? null
}

export function writePeriodPending(key: string, period: number, promise: Promise<any>) {
	periodPending.set(`${key}:${period}`, promise)
	return promise
}

export function clearPeriodPending(key: string, period: number) {
	periodPending.delete(`${key}:${period}`)
}
