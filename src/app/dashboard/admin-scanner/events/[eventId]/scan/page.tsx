import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ScannerClient from './scanner-client'

export default async function ScanPage(props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const { eventId } = params;

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let manualCheckinAllowed = false
  if (user) {
    const { data: assignment } = await supabase
      .from('event_staff_assignments')
      .select('manual_checkin_allowed')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    manualCheckinAllowed = !!assignment?.manual_checkin_allowed
  }

  return <ScannerClient eventId={eventId} manualCheckinAllowed={manualCheckinAllowed} />
}
