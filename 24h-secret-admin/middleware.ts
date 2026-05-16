import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('admin_auth')?.value
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
