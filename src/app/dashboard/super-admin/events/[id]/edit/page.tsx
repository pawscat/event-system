import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EventForm } from '../../event-form'

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params
  
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
    .eq('id', id)
    .single()

  if (error || !event) {
    redirect('/dashboard/super-admin/events')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-body-sm text-[14px] text-text-muted mb-1 flex items-center gap-2">
            <Link href="/dashboard/super-admin/events" className="hover:text-secondary cursor-pointer">Acara</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href={`/dashboard/super-admin/events/${event.id}`} className="hover:text-secondary cursor-pointer max-w-[150px] truncate">{event.name}</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-text-main font-medium">Edit</span>
          </div>
          <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">Pengaturan Acara</h1>
        </div>
      </div>

      <EventForm initialData={event} eventId={event.id} />
    </div>
  )
}
