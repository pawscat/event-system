import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getActiveEventId } from '@/lib/actions/auth-actions'

export default async function AdminEventPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const activeEventId = await getActiveEventId()

  if (!activeEventId) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        Tidak ada event yang aktif atau ditugaskan.
      </div>
    )
  }

  // Fetch Event Details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', activeEventId)
    .single()

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] font-semibold text-primary">Dashboard Event</h2>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Mengelola operasional acara {event?.name}</p>
        </div>
      </div>
      
      <div className="bg-surface p-6 rounded-xl border border-border-light shadow-sm">
        <h3 className="font-title-md font-semibold mb-4 text-text-main">Ringkasan Event: {event?.name}</h3>
        <p className="text-body-sm text-text-muted">Fitur selengkapnya sedang dikembangkan. Anda berada di dashboard yang dibatasi hanya untuk event ini.</p>
      </div>
    </div>
  )
}
