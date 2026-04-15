import type { APIRoute } from 'astro'
import cookie from 'cookie'

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie.serialize('auth', '', {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        expires: new Date(0)
      })
    }
  })
}
