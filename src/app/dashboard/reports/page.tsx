import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function ReportsPage() {
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

  // Fetch basic stats
  const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true })
  const { count: totalParticipants } = await supabase.from('participants').select('*', { count: 'exact', head: true })
  const { count: totalCheckins } = await supabase.from('attendances').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Laporan & Analitik</h1>
        <p className="text-body-sm text-[14px] text-text-muted mt-1">Ringkasan statistik sistem Event Ku</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm">
          <div className="text-text-muted text-[13px] font-medium uppercase tracking-wider mb-2">Total Acara</div>
          <div className="text-headline-lg text-[32px] font-bold text-primary">{totalEvents || 0}</div>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm">
          <div className="text-text-muted text-[13px] font-medium uppercase tracking-wider mb-2">Total Pendaftar</div>
          <div className="text-headline-lg text-[32px] font-bold text-secondary">{totalParticipants || 0}</div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm">
          <div className="text-text-muted text-[13px] font-medium uppercase tracking-wider mb-2">Total Check-in</div>
          <div className="text-headline-lg text-[32px] font-bold text-success">{totalCheckins || 0}</div>
          <div className="text-[12px] text-text-muted mt-2">
            Tingkat Kehadiran: {totalParticipants ? Math.round((totalCheckins || 0) / totalParticipants * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <span className="material-symbols-outlined text-6xl text-text-muted mb-4">insights</span>
        <h2 className="text-title-lg font-semibold text-text-main mb-2">Grafik Lanjutan</h2>
        <p className="text-body-md text-text-muted max-w-md">
          Modul grafik dan analitik lanjutan sedang dikembangkan. Nantinya Anda dapat melihat tren pendaftaran harian dan demografi peserta di sini.
        </p>
      </div>
    </div>
  )
}
