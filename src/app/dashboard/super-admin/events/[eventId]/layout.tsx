import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EventTabs } from './event-tabs'

export default async function SuperAdminEventLayout(props: {
  children: React.ReactNode
  params: Promise<{ eventId: string }>
}) {
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

  const { data: event, error } = await supabase
    .from('events')
    .select('name, status')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    redirect('/dashboard/super-admin/events')
  }

  return (
    <div className="w-full">
      {/* Universal Header for this Event Scope */}
      <div className="mb-6">
        <div className="text-body-sm text-[14px] text-text-muted mb-2 flex items-center gap-2">
          <Link href="/dashboard/super-admin/events" className="hover:text-secondary cursor-pointer">Semua Acara</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-text-main font-medium truncate max-w-[200px] md:max-w-xs">{event.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">{event.name}</h1>
            <span className={`px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold uppercase tracking-wide
              ${event.status === 'published' ? 'bg-success/10 text-success' : 
                event.status === 'registration_closed' ? 'bg-warning/10 text-warning' : 
                event.status === 'completed' ? 'bg-secondary/10 text-secondary' : 
                event.status === 'archived' ? 'bg-surface-container-highest text-text-muted' : 
                event.status === 'cancelled' ? 'bg-error/10 text-error' : 
                'bg-surface-container-highest text-text-muted'}`}>
              {event.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/super-admin/events/${eventId}/participants`} className="bg-secondary text-on-secondary font-label-md text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Kelola Peserta
            </Link>
            <Link href={`/dashboard/super-admin/events/${eventId}/attendance`} className="bg-surface-container-lowest text-secondary border border-secondary font-label-md text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              Buka Scanner
            </Link>
          </div>
        </div>
      </div>

      <EventTabs eventId={eventId} />

      {/* Page Content */}
      <div className="w-full">
        {props.children}
      </div>
    </div>
  )
}
