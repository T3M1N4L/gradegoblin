import type { APIRoute } from 'astro'
import { login as svLogin } from '../../lib/svue'
import cookie from 'cookie'
import { writeDashboardCache } from '$lib/server/dashboardCache'

export const POST: APIRoute = async ({ request }) => {
  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { districtUrl, username, password } = body
  if (!districtUrl || !username || !password) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
  }

  try {
    const client = await svLogin(districtUrl, username, password)

    const [studentInfo, gradebook0] = await Promise.all([
      client.getStudentInfo(),
      client.getGradebook(0)
    ])

    if (!studentInfo) throw new Error('No student info')

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

    if (!periods[currentPeriod]) currentPeriod = 0

    const cookieValue =
      Buffer.from(username).toString('base64') +
      ':' +
      Buffer.from(password).toString('base64') +
      ':' +
      Buffer.from(districtUrl).toString('base64')

    writeDashboardCache(cookieValue, {
      student: studentInfo,
      periods,
      currentPeriod,
      totalPeriods,
      periodDates: reportingPeriods
    })

    return new Response(
      JSON.stringify({
        student: studentInfo,
        periods,
        currentPeriod,
        totalPeriods,
        periodDates: reportingPeriods
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie.serialize('auth', cookieValue, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'strict',
            path: '/'
          })
        }
      }
    )
  } catch (error) {
    console.error('[/api/login]', error)
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
  }
}
