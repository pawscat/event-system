import { redirect } from 'next/navigation'
import { getUserAuthData, getActiveEventId, setActiveEventId } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '../dashboard-client-shell'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authData = await getUserAuthData()

  // Must have 'event_admin' or 'super_admin' to access this dashboard
  const isSuperAdmin = authData?.role === 'super_admin'
  const isEventAdmin = authData?.assignments.some(a => a.role === 'event_admin')
  
  if (!authData || (!isSuperAdmin && !isEventAdmin)) {
    redirect('/dashboard') // Route back to root for redirection
  }

  // Get active event from cookie or select the first assigned one
  let activeEventId = await getActiveEventId()
  const eventAdminAssignments = authData.assignments.filter(a => a.role === 'event_admin')
  
  // If no active event or active event is not in their assignments, pick the first one
  if (!activeEventId || !eventAdminAssignments.some(a => a.event_id === activeEventId)) {
    if (eventAdminAssignments.length > 0) {
      activeEventId = eventAdminAssignments[0].event_id
      await setActiveEventId(activeEventId)
    }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.email || 'Admin'

  const eventOptions = eventAdminAssignments.map(a => ({
    id: a.event_id,
    name: a.events.name,
    slug: a.events.slug,
    role: a.role
  }))

  return (
    <DashboardClientShell 
      dashboardType="admin-event" 
      userName={userName}
      eventOptions={eventOptions}
      activeEventId={activeEventId}
    >
      {children}
    </DashboardClientShell>
  )
}
