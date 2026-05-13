import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
} as const

function createClientInternal(url: string, key: string): SupabaseClient {
  return createClient(url, key, clientOptions)
}

/**
 * Use in Route Handlers to avoid an uncaught exception (generic "Internal Server Error")
 * when Supabase env vars are missing.
 */
export function getServiceRoleClient(): SupabaseClient | NextResponse {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    return NextResponse.json(
      {
        error:
          'Server misconfigured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
      },
      { status: 503 },
    )
  }
  return createClientInternal(url, key)
}

export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClientInternal(url, key)
}
