import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PublicEventPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) {
    notFound()
  }

  // Check if registration is open
  const now = new Date()
  const regOpen = event.registration_open_at ? new Date(event.registration_open_at) : null
  const regClose = event.registration_close_at ? new Date(event.registration_close_at) : null
  
  let regStatus = 'open'
  if (event.status !== 'published') {
    regStatus = 'closed'
  } else if (regOpen && now < regOpen) {
    regStatus = 'upcoming'
  } else if (regClose && now > regClose) {
    regStatus = 'closed'
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-text-main flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border-light py-4 px-6 md:px-12 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold">
            E
          </div>
          <span className="font-title-lg font-bold text-primary">Event Ku</span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-primary/5 py-16 px-6 md:px-12 border-b border-border-light">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-6">
            {event.status === 'published' ? 'Pendaftaran Dibuka' : 'Segera Hadir'}
          </span>
          <h1 className="text-4xl md:text-5xl font-headline-lg font-bold text-text-main mb-6">
            {event.name}
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-text-muted font-medium mb-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              <span>{new Date(event.start_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              <span>{event.venue || 'TBA'}</span>
            </div>
          </div>
          
          {regStatus === 'open' ? (
            <button className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-label-lg font-bold hover:bg-primary/90 transition-all shadow-md transform hover:scale-105 active:scale-95">
              Daftar Sekarang
            </button>
          ) : regStatus === 'upcoming' ? (
            <button disabled className="bg-surface-container-high text-text-muted px-8 py-3.5 rounded-full font-label-lg font-bold shadow-sm cursor-not-allowed">
              Pendaftaran Belum Dibuka
            </button>
          ) : (
            <button disabled className="bg-surface-container-high text-text-muted px-8 py-3.5 rounded-full font-label-lg font-bold shadow-sm cursor-not-allowed">
              Pendaftaran Ditutup
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-headline-sm font-bold text-text-main mb-6">Tentang Acara</h2>
          <div className="prose prose-blue max-w-none text-text-main">
            {event.description ? (
              <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
            ) : (
              <p className="text-text-muted italic">Deskripsi acara belum tersedia.</p>
            )}
          </div>
        </div>
        
        {/* Registration Form UI (Mockup for now) */}
        {regStatus === 'open' && (
          <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-8 md:p-10" id="register">
            <h2 className="text-2xl font-headline-sm font-bold text-text-main mb-6">Formulir Pendaftaran</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Nama Lengkap *</label>
                  <input type="text" className="w-full px-4 py-3 bg-surface-container-lowest border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" placeholder="Masukkan nama lengkap Anda" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Email *</label>
                  <input type="email" className="w-full px-4 py-3 bg-surface-container-lowest border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" placeholder="nama@email.com" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Nomor HP/WA *</label>
                  <input type="tel" className="w-full px-4 py-3 bg-surface-container-lowest border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" placeholder="08123456789" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Organisasi / Perusahaan</label>
                  <input type="text" className="w-full px-4 py-3 bg-surface-container-lowest border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" placeholder="Nama instansi Anda" />
                </div>
              </div>
              <div className="pt-4 border-t border-border-light mt-6">
                <button type="button" className="w-full md:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 text-center">
                  Selesaikan Pendaftaran
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-surface border-t border-border-light py-8 px-6 text-center text-text-muted mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Event Ku. All rights reserved.</p>
      </footer>
    </div>
  )
}
