'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type UserRole = 'super_admin' | 'admin'
export type StaffRole = 'event_admin' | 'registration_admin' | 'scanner_admin'

export interface EventAssignment {
  event_id: string
  role: StaffRole
  status: 'active' | 'inactive'
  events: {
    id: string
    name: string
    slug: string
  }
}

export interface UserAuthData {
  id: string
  auth_provider_id: string
  role: UserRole
  assignments: EventAssignment[]
}

// Internal helper to create supabase client
async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in server actions
          }
        },
      },
    }
  )
}

export async function getUserAuthData(): Promise<UserAuthData | null> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('id, auth_provider_id, role')
    .eq('auth_provider_id', user.id)
    .single()

  if (!userData) return null

  // If super_admin, we don't strictly need assignments for routing, but we'll fetch them anyway
  // Actually, let's fetch assignments for all admins
  const { data: assignments } = await supabase
    .from('event_staff_assignments')
    .select(`
      event_id,
      role,
      status,
      events (id, name, slug)
    `)
    .eq('user_id', userData.id)
    .eq('status', 'active')

  return {
    id: userData.id,
    auth_provider_id: userData.auth_provider_id,
    role: userData.role as UserRole,
    assignments: (assignments as any) || []
  }
}

export async function determineDashboardRoute(authData: UserAuthData): Promise<string> {
  if (authData.role === 'super_admin') {
    return '/dashboard/super-admin'
  }

  // Determine highest priority role from assignments
  // Priority: event_admin > registration_admin > scanner_admin
  const hasEventAdmin = authData.assignments.some(a => a.role === 'event_admin')
  const hasRegAdmin = authData.assignments.some(a => a.role === 'registration_admin')
  const hasScannerAdmin = authData.assignments.some(a => a.role === 'scanner_admin')

  if (hasEventAdmin) return '/dashboard/admin-event'
  if (hasRegAdmin) return '/dashboard/admin-registrasi'
  if (hasScannerAdmin) return '/dashboard/admin-scanner'

  // If admin but no assignments, redirect to a fallback or return null
  return '/dashboard/no-access'
}

export async function setActiveEventId(eventId: string) {
  const cookieStore = await cookies()
  cookieStore.set('active_event_id', eventId, { path: '/' })
}

export async function getActiveEventId(): Promise<string | null> {
  const cookieStore = await cookies()
  const activeEventCookie = cookieStore.get('active_event_id')
  return activeEventCookie?.value || null
}
