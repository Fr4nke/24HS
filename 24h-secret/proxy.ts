import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ipMap = new Map<string, number[]>()

export function proxy(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next()

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const now = Date.now()
  const timestamps = (ipMap.get(ip) ?? []).filter((t) => now - t < 60_000)

  if (timestamps.length >= 5) {
    return NextResponse.json(
      { error: 'For mange forsøk. Vent litt.' },
      { status: 429 }
    )
  }

  ipMap.set(ip, [...timestamps, now])
  return NextResponse.next()
}

export const config = { matcher: '/api/secrets' }
