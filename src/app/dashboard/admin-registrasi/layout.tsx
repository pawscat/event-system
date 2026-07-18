import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { DashboardClientShell } from '@/components/dashboard/dashboard-shell'
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

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.email || 'Admin Registrasi'

  return (
    <DashboardClientShell 
      dashboardType="admin-registrasi" 
      userName={userName}
    >
      {children}
    </DashboardClientShell>
  )
}
