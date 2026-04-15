import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware((context, next) => {
  const authCookie = context.cookies.get('auth')

  if (authCookie?.value) {
    const parts = authCookie.value.split(':')
    if (parts.length >= 3) {
      context.locals.user = {
        username: parts[0],
        password: parts[1],
        districtUrl: parts[2]
      }
    }
  }

  return next()
})
