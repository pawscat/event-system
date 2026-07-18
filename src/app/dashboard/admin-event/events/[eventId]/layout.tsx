import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'
import { ReactNode } from 'react'

export default async function AdminEventScopeLayout(props: {
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

  // Check if they are an event_admin for THIS SPECIFIC event
  const isAssignedToEvent = authData.assignments.some(
    a => a.event_id === eventId && a.role === 'event_admin'
  )

  if (!isAssignedToEvent) {
    redirect('/unauthorized')
  }

  return <>{props.children}</>
}
