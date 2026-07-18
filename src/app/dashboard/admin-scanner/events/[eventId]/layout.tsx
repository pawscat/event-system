import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { ReactNode } from 'react'

export default async function AdminScannerScopeLayout(props: {
  children: ReactNode
  params: Promise<{ eventId: string }>
}) {
  const params = await props.params;
  const { eventId } = params;
  const authData = await getUserAuthData()

  if (!authData) {
    redirect('/login')
  }

  // Super admin can access anything
  if (authData.role === 'super_admin') {
    return <>{props.children}</>
  }

  // scanner_admin or event_admin or registration_admin can scan
  const isAssignedToEvent = authData.assignments.some(
    a => a.event_id === eventId && ['scanner_admin', 'registration_admin', 'event_admin'].includes(a.role)
  )

  if (!isAssignedToEvent) {
    redirect('/unauthorized')
  }

  return <>{props.children}</>
}
