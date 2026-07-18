import { redirect } from 'next/navigation'
import { getUserAuthData, determineDashboardRoute } from '@/lib/actions/auth-actions'

export const dynamic = 'force-dynamic'

export default async function DashboardRoot() {
  const authData = await getUserAuthData()
  
  if (!authData) {
    redirect('/login')
  }

  const route = await determineDashboardRoute(authData)
  redirect(route)
}
