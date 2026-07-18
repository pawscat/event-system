import { redirect } from 'next/navigation'
import { getUserAuthData, getActiveEventId, setActiveEventId } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '../dashboard-client-shell'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminRegistrasiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authData = await getUserAuthData()

  const isRegAdmin = authData?.assignments.some(a => a.role === 'registration_admin')
  
  if (!authData || !isRegAdmin) {
    redirect('/dashboard')
  }

  let activeEventId = await getActiveEventId()
  const regAdminAssignments = authData.assignments.filter(a => a.role === 'registration_admin')
  
  if (!activeEventId || !regAdminAssignments.some(a => a.event_id === activeEventId)) {
    if (regAdminAssignments.length > 0) {
      activeEventId = regAdminAssignments[0].event_id
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
  const userName = user?.email || 'Admin Registrasi'

  const eventOptions = regAdminAssignments.map(a => ({
    id: a.event_id,
    name: a.events.name,
    slug: a.events.slug,
    role: a.role
  }))

  return (
    <DashboardClientShell 
      dashboardType="admin-registrasi" 
      userName={userName}
      eventOptions={eventOptions}
      activeEventId={activeEventId}
    >
      {children}
    </DashboardClientShell>
  )
}
