import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EventForm } from '@/app/dashboard/super-admin/events/event-form'

export default async function EditEventPage(props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const { eventId } = params
  
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

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    redirect('/dashboard/admin-event')
  }

  return (
    <div className="space-y-6">
      <EventForm initialData={event} eventId={eventId} />
    </div>
  )
}
