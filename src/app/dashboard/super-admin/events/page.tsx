import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function EventsPage() {
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

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">Daftar Acara</h1>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Kelola seluruh kegiatan dan logistik acara Anda di satu tempat.</p>
        </div>
        <Link href="/dashboard/super-admin/events/new" className="bg-secondary text-on-secondary font-label-md text-[14px] font-semibold px-6 py-2.5 rounded-lg hover:bg-secondary-container transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Event Baru
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-border-light mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="block font-label-sm text-[12px] font-medium text-text-muted mb-1.5">Pencarian</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">search</span>
            <input className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-sm text-[14px] text-text-main bg-surface-bright" placeholder="Cari nama acara..." type="text" />
          </div>
        </div>
        <div className="w-full md:w-48">
          <label className="block font-label-sm text-[12px] font-medium text-text-muted mb-1.5">Status</label>
          <div className="relative">
            <select className="w-full appearance-none px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-sm text-[14px] text-text-main bg-surface-bright pr-10 cursor-pointer">
              <option value="">Semua Status</option>
              <option value="published">Aktif / Dipublikasikan</option>
              <option value="draft">Draft</option>
              <option value="archived">Selesai / Diarsipkan</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      {/* Event List / Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events && events.map((event) => {
          const isPublished = event.status === 'published'
          const isDraft = event.status === 'draft'
          const statusColors = isPublished 
            ? 'bg-success/10 text-success border-success/20' 
            : isDraft ? 'bg-surface-container-highest text-text-muted border-border-light'
            : 'bg-surface-container-high text-text-main border-border-light'
            
          return (
            <div key={event.id} className={`bg-surface-container-lowest rounded-xl border border-border-light overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col ${event.status === 'archived' ? 'opacity-75' : ''}`}>
              <div className={`h-32 bg-surface-container relative w-full overflow-hidden ${event.status === 'archived' ? 'grayscale' : ''}`}>
                <div 
                  className="bg-cover bg-center w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundImage: `url('${event.banner_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}')` }}
                ></div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${statusColors}`}>
                    {event.status === 'published' ? 'Aktif' : event.status === 'draft' ? 'Draft' : 'Selesai'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-headline-sm text-[20px] font-semibold text-text-main mb-2 line-clamp-1">{event.name}</h3>
                
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-text-muted">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    <span className="font-body-sm text-[14px]">
                      {event.start_time ? new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="font-body-sm text-[14px] line-clamp-1">{event.location_name || '-'}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border-light grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-label-sm text-[12px] font-medium text-text-muted mb-1">Registrasi / Kuota</div>
                    <div className="font-label-md text-[14px] font-semibold text-text-main">
                      -- <span className="text-text-muted font-normal text-[12px]">/ {event.capacity || '∞'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover Overlay Actions */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Link href={`/dashboard/super-admin/events/${event.id}/settings`} className="bg-surface-container-lowest text-text-main p-2 rounded-lg hover:text-secondary shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </Link>
                <Link href={`/dashboard/super-admin/events/${event.id}/overview`} className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md text-[14px] font-semibold shadow-sm">
                  Lihat Detail
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
