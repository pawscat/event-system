import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function RegistrationPreviewPage(props: { params: Promise<{ eventId: string }> }) {
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

  const { data: event } = await supabase
    .from('events')
    .select('slug, name')
    .eq('id', eventId)
    .single()

  const publicUrl = event?.slug ? `/public/events/${event.slug}` : '#'

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Preview Form Pendaftaran</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Tampilan publik form registrasi untuk {event?.name}</p>
        </div>
        <a 
          href={publicUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border-light bg-surface-container-lowest text-text-main font-label-md text-[14px] font-semibold rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Buka di Tab Baru
        </a>
      </div>

      <div className="flex-1 bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="bg-surface-container-low border-b border-border-light px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/80"></div>
            <div className="w-3 h-3 rounded-full bg-warning/80"></div>
            <div className="w-3 h-3 rounded-full bg-success/80"></div>
          </div>
          <div className="ml-4 bg-surface px-3 py-1 rounded border border-border-light text-xs font-mono text-text-muted flex-1 max-w-md truncate">
            {process.env.NEXT_PUBLIC_BASE_URL}{publicUrl}
          </div>
        </div>
        {event?.slug ? (
          <iframe 
            src={publicUrl} 
            className="w-full flex-1 border-none bg-surface"
            title="Registration Preview"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            Event tidak valid atau slug belum diatur.
          </div>
        )}
      </div>
    </div>
  )
}
