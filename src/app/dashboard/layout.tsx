import { DashboardClientShell } from './dashboard-client-shell'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('auth_provider_id', user.id)
    .single()

  const userName = userData?.full_name || user.email || 'Admin'
  const isSuperAdmin = userData?.role === 'super_admin'

  return (
    <DashboardClientShell isSuperAdmin={isSuperAdmin} userName={userName}>
      {children}
    </DashboardClientShell>
  )
}
