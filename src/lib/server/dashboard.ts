import { getAuthedClient } from '$lib/server/studentvue'
import { parseData } from '$lib/js/parseData'
import {
	clearDashboardPending,
	clearPeriodPending,
	getDashboardCacheKey,
	readDashboardPending,
	readDashboardCache,
	readPeriodPending,
	writeDashboardPending,
	writePeriodPending,
	writeDashboardCache
} from '$lib/server/dashboardCache'

export async function loadDashboard(locals: App.Locals, selectedPeriod?: number) {
	if (!locals.user) throw new Error('Unauthorized')

	const cacheKey = getDashboardCacheKey(locals.user)
	let cached = readDashboardCache(cacheKey)
	let client

	if (!cached) {
		const pending = readDashboardPending(cacheKey)
		if (pending) {
			cached = await pending
		} else {
			const initialLoad = writeDashboardPending(
				cacheKey,
				(async () => {
					client = await getAuthedClient(locals)
					const [studentInfo, gradebook0] = await Promise.all([
						client.getStudentInfo(),
						client.getGradebook(0)
					])

					const reportingPeriodsRaw = gradebook0?.ReportingPeriods?.ReportPeriod
					const reportingPeriods = Array.isArray(reportingPeriodsRaw)
						? reportingPeriodsRaw
						: reportingPeriodsRaw
							? [reportingPeriodsRaw]
							: []

					if (!reportingPeriods.length) {
						throw new Error('Missing reporting periods in gradebook data')
					}

					let currentPeriod = 0
					const now = new Date()
					for (let i = reportingPeriods.length - 1; i >= 0; i--) {
						if (now >= new Date(reportingPeriods[i].StartDate)) {
							currentPeriod = i
							break
						}
					}

					const periods = new Array(reportingPeriods.length).fill(null)
					periods[0] = gradebook0

					return writeDashboardCache(cacheKey, {
						student: studentInfo,
						periodDates: reportingPeriods,
						totalPeriods: reportingPeriods.length,
						currentPeriod,
						periods
					})
				})()
			)

			try {
				cached = await initialLoad
			} finally {
				clearDashboardPending(cacheKey)
			}
		}
	}

	const periods = [...cached.periods]
	const totalPeriods = cached.totalPeriods
	const currentPeriod = cached.currentPeriod

	let activePeriod = Number.isInteger(selectedPeriod) ? Number(selectedPeriod) : currentPeriod
	if (activePeriod < 0 || activePeriod >= totalPeriods) activePeriod = currentPeriod

	if (!periods[activePeriod]) {
		client ??= await getAuthedClient(locals)
		const pending = readPeriodPending(cacheKey, activePeriod)
		if (pending) {
			periods[activePeriod] = await pending
		} else {
			const request = writePeriodPending(cacheKey, activePeriod, client.getGradebook(activePeriod))
			try {
				periods[activePeriod] = await request
			} finally {
				clearPeriodPending(cacheKey, activePeriod)
			}
		}
	}
	if (!periods[currentPeriod]) {
		client ??= await getAuthedClient(locals)
		if (activePeriod === currentPeriod) {
			periods[currentPeriod] = periods[activePeriod]
		} else {
			const pending = readPeriodPending(cacheKey, currentPeriod)
			if (pending) {
				periods[currentPeriod] = await pending
			} else {
				const request = writePeriodPending(cacheKey, currentPeriod, client.getGradebook(currentPeriod))
				try {
					periods[currentPeriod] = await request
				} finally {
					clearPeriodPending(cacheKey, currentPeriod)
				}
			}
		}
	}

	parseData(periods, null, 'amoled')

	const snapshot = writeDashboardCache(cacheKey, {
		student: cached.student,
		periodDates: cached.periodDates,
		totalPeriods,
		currentPeriod,
		periods
	})

	return {
		student: snapshot.student,
		periods: snapshot.periods,
		periodDates: snapshot.periodDates,
		totalPeriods,
		currentPeriod,
		selectedPeriod: activePeriod,
		gradebook: snapshot.periods[activePeriod],
		selected: snapshot.periods[activePeriod]
	}
}

export function readSelectedPeriod(cookies: AstroCookies) {
	const raw = cookies.get('selected-period')?.value
	if (!raw) return undefined
	const parsed = Number(raw)
	return Number.isNaN(parsed) ? undefined : parsed
}
