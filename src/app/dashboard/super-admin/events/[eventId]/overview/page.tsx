import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CopyButton } from './copy-button'

export default async function EventSummaryPage(props: { params: Promise<{ eventId: string }> }) {
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

  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    redirect('/dashboard/super-admin/events')
  }

  const isPublished = event.status === 'published'
  const isDraft = event.status === 'draft'

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-body-sm text-[14px] text-text-muted mb-1 flex items-center gap-2">
            <Link href="/dashboard/super-admin/events" className="hover:text-secondary cursor-pointer">Acara</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-text-main font-medium truncate max-w-[200px] md:max-w-xs">{event.name}</span>
          </div>
          <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">Dashboard Acara</h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-secondary text-on-secondary font-label-md text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Tambah Peserta
          </button>
          <Link href="/scanner" className="bg-surface-container-lowest text-secondary border border-secondary font-label-md text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
            Buka Scanner
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Event Hero Card */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative">
          <div className="h-32 bg-gradient-to-r from-secondary-container to-secondary relative">
            <div 
              className={`absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center ${event.status === 'archived' ? 'grayscale' : ''}`}
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')" }}
            ></div>
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              {isPublished && <span className="bg-success/20 text-success px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-success/30">Aktif</span>}
              {isDraft && <span className="bg-surface-container-highest text-text-muted px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-border-light">Draft</span>}
              {!isPublished && !isDraft && <span className="bg-surface-container-high text-text-main px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-border-light">Selesai</span>}
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="font-headline-md text-[24px] font-semibold text-text-main mb-2">{event.name}</h2>
            
            <div className="flex flex-wrap gap-y-3 gap-x-6 text-body-sm text-[14px] text-text-muted mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {new Date(event.start_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(event.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {event.venue}
              </div>
            </div>
            
            <CopyButton slug={event.slug} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-4 bg-surface-container-lowest border border-border-light rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-[20px] font-semibold text-text-main mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 border border-border-light rounded-lg hover:border-secondary hover:bg-surface-container-low transition-all group text-center">
                <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">upload_file</span>
                <span className="font-label-sm text-[12px] font-medium text-text-main">Import CSV</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-border-light rounded-lg hover:border-secondary hover:bg-surface-container-low transition-all group text-center">
                <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">campaign</span>
                <span className="font-label-sm text-[12px] font-medium text-text-main">Kirim Broadcast</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-border-light rounded-lg hover:border-secondary hover:bg-surface-container-low transition-all group text-center">
                <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">print</span>
                <span className="font-label-sm text-[12px] font-medium text-text-main">Cetak ID Card</span>
              </button>
              <Link href={`/dashboard/super-admin/events/${eventId}/settings`} className="flex flex-col items-center justify-center p-4 border border-border-light rounded-lg hover:border-secondary hover:bg-surface-container-low transition-all group text-center">
                <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">settings</span>
                <span className="font-label-sm text-[12px] font-medium text-text-main">Pengaturan Acara</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* TODO: Add Data Table for Participants specific to this event */}
    </div>
  )
}
