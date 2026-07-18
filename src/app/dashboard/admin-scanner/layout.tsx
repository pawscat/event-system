import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '@/components/dashboard/dashboard-shell'
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

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.email || 'Scanner Admin'

  return (
    <DashboardClientShell 
      dashboardType="admin-scanner" 
      userName={userName}
    >
      {children}
    </DashboardClientShell>
  )
}
