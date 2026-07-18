import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { RegistrationForm } from './registration-form'

export const dynamic = 'force-dynamic'

export default async function PublicEventPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-subtle">
        <div className="bg-surface p-8 rounded-xl border border-border-light text-center">
          <span className="material-symbols-outlined text-[48px] text-danger mb-4">error</span>
          <h1 className="font-headline-md text-text-main mb-2">Acara Tidak Ditemukan</h1>
          <p className="font-body-md text-text-muted">Acara yang Anda cari tidak ada atau belum dipublikasikan.</p>
        </div>
      </div>
    )
  }

  // Calculate formatted dates
  const eventDate = new Date(event.start_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const startTime = new Date(event.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const endTime = new Date(event.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const closeDate = event.registration_close_at ? new Date(event.registration_close_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : null

  return (
    <div className="bg-background-subtle text-on-surface antialiased min-h-screen">
      {/* Top Navigation */}
      <header className="bg-surface border-b border-border-light sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
            <span className="font-headline-sm text-primary tracking-tight">Event Ku</span>
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* Hero Banner Section */}
        <section className="relative w-full min-h-[300px] md:min-h-[400px] bg-primary">
          <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-80"></div>
          <div className="relative z-10 flex flex-col justify-end h-full min-h-[300px] md:min-h-[400px] max-w-[1280px] mx-auto px-6 pt-24 pb-24 md:pb-32">
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full mb-4 w-fit backdrop-blur-sm border border-secondary/30">
              <span className="material-symbols-outlined text-sm">campaign</span>
              <span className="font-label-sm uppercase tracking-wider">Pendaftaran Terbuka</span>
            </div>
            <h1 className="font-display-lg text-[36px] md:text-[48px] md:leading-[56px] text-on-primary mb-2 max-w-3xl">{event.name}</h1>
            <p className="font-body-lg text-[18px] text-on-primary/80 max-w-2xl">{event.description}</p>
          </div>
        </section>

        <div className="max-w-[1280px] mx-auto px-6 mt-[-40px] md:mt-[-60px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light p-6">
                <h2 className="font-headline-sm text-[20px] font-semibold text-text-main mb-6 border-b border-border-light pb-4">Detail Acara</h2>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">calendar_today</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-[14px] text-text-muted mb-1">Tanggal</h3>
                      <p className="font-body-md text-[16px] text-text-main font-medium">{eventDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-[14px] text-text-muted mb-1">Waktu</h3>
                      <p className="font-body-md text-[16px] text-text-main font-medium">{startTime} - {endTime} WIB</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-[14px] text-text-muted mb-1">Lokasi</h3>
                      <p className="font-body-md text-[16px] text-text-main font-medium">{event.venue}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-border-light flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-[32px] text-text-muted">corporate_fare</span>
                  </div>
                  <div>
                    <h3 className="font-label-sm text-[12px] text-text-muted uppercase tracking-wider mb-1">Penyelenggara</h3>
                    <p className="font-body-md text-[16px] text-text-main font-semibold">Event Ku Organizer</p>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-4 border border-border-light/50">
                  {closeDate && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-md text-[14px] text-text-muted">Batas Pendaftaran</span>
                      <span className="font-label-md text-[14px] text-danger">{closeDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-[14px] text-text-muted">Status Kuota</span>
                    <span className="inline-flex items-center gap-1 bg-success/10 text-success font-label-sm text-[12px] px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Tersedia
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form Component */}
            <div className="lg:col-span-8">
              <RegistrationForm eventId={event.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
