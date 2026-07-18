import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '@/components/dashboard/dashboard-shell'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authData = await getUserAuthData()

  if (!authData || authData.role !== 'super_admin') {
    redirect('/dashboard') // Route back to root, which will redirect to correct dashboard or login
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.email || 'Super Admin'

  return (
    <DashboardClientShell 
      dashboardType="super-admin" 
      userName={userName}
    >
      {children}
    </DashboardClientShell>
  )
}
