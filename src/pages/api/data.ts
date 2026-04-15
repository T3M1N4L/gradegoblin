import type { APIRoute } from 'astro'
import cookie from 'cookie'
import { getAuthedClient } from '$lib/server/studentvue'

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const client = await getAuthedClient(locals)
    const [studentInfo, gradebook0] = await Promise.all([
      client.getStudentInfo(),
      client.getGradebook(0)
    ])

    if (!studentInfo) throw new Error('No student info returned')

    const reportingPeriodsRaw = gradebook0?.ReportingPeriods?.ReportPeriod
    const reportingPeriods: any[] = Array.isArray(reportingPeriodsRaw)
      ? reportingPeriodsRaw
      : reportingPeriodsRaw
        ? [reportingPeriodsRaw]
        : []
    if (!reportingPeriods.length) {
      throw new Error('Missing reporting periods in gradebook data')
    }
    const totalPeriods = reportingPeriods.length

    const now = new Date()
    let currentPeriod = 0
    for (let i = reportingPeriods.length - 1; i >= 0; i--) {
      if (now >= new Date(reportingPeriods[i].StartDate)) {
        currentPeriod = i
        break
      }
    }

    const periods: (any | null)[] = new Array(totalPeriods).fill(null)
    periods[0] = gradebook0

    if (currentPeriod !== 0) {
      periods[currentPeriod] = await client.getGradebook(currentPeriod)
    }

    if (!periods[currentPeriod]) {
      currentPeriod = 0
    }

    return new Response(
      JSON.stringify({
        student: studentInfo,
        periods,
        currentPeriod,
        totalPeriods,
        periodDates: reportingPeriods
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[/api/data]', error)
    return new Response(JSON.stringify({ error: 'Auth failed' }), {
      status: 401,
      headers: {
        'Set-Cookie': cookie.serialize('auth', '', {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          expires: new Date(0)
        })
      }
    })
  }
}
