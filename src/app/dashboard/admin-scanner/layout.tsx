import { redirect } from 'next/navigation'
import { getUserAuthData, getActiveEventId, setActiveEventId } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '../dashboard-client-shell'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminScannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authData = await getUserAuthData()

  const isScannerAdmin = authData?.assignments.some(a => a.role === 'scanner_admin')
  
  if (!authData || !isScannerAdmin) {
    redirect('/dashboard')
  }

  let activeEventId = await getActiveEventId()
  const scannerAdminAssignments = authData.assignments.filter(a => a.role === 'scanner_admin')
  
  if (!activeEventId || !scannerAdminAssignments.some(a => a.event_id === activeEventId)) {
    if (scannerAdminAssignments.length > 0) {
      activeEventId = scannerAdminAssignments[0].event_id
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
  const userName = user?.email || 'Scanner Admin'

  const eventOptions = scannerAdminAssignments.map(a => ({
    id: a.event_id,
    name: a.events.name,
    slug: a.events.slug,
    role: a.role
  }))

  return (
    <DashboardClientShell 
      dashboardType="admin-scanner" 
      userName={userName}
      eventOptions={eventOptions}
      activeEventId={activeEventId}
    >
      {children}
    </DashboardClientShell>
  )
}
