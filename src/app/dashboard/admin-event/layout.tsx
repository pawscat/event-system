import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '@/components/dashboard/dashboard-shell'
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
  // Since they only have 1 active assignment per role, we can just check if they have it
  const isEventAdmin = authData?.assignments.some(a => a.role === 'event_admin')
  
  if (!authData || (!isSuperAdmin && !isEventAdmin)) {
    redirect('/dashboard') // Route back to root for redirection
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.email || 'Admin'

  return (
    <DashboardClientShell 
      dashboardType="admin-event" 
      userName={userName}
    >
      {children}
    </DashboardClientShell>
  )
}
