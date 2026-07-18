import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { ReactNode } from 'react'

export default async function AdminRegistrasiScopeLayout(props: {
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

  // Check if they are a registration_admin for THIS SPECIFIC event
  // Wait, what if they are an event_admin for this event? Should event_admin be able to access registration?
  // Usually event_admin manages the whole event, so yes. Let's allow event_admin too.
  const isAssignedToEvent = authData.assignments.some(
    a => a.event_id === eventId && (a.role === 'registration_admin' || a.role === 'event_admin')
  )

  if (!isAssignedToEvent) {
    redirect('/unauthorized')
  }

  return <>{props.children}</>
}
