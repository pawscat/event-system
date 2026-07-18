import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getActiveEventId } from '@/lib/actions/auth-actions'
import Link from 'next/link'

export default async function AdminScannerPage() {
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

  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', activeEventId)
    .single()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-headline-lg text-[28px] font-semibold text-primary">QR Scanner Area</h2>
        <p className="font-body-sm text-[14px] text-text-muted mt-1">Check-in peserta untuk {event?.name}</p>
      </div>
      
      <div className="bg-surface p-8 rounded-2xl border border-border-light shadow-sm text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px] text-primary">qr_code_scanner</span>
        </div>
        <h3 className="font-title-lg text-[22px] font-semibold mb-2 text-text-main">Mulai Scan QR Tiket</h3>
        <p className="text-body-sm text-text-muted mb-8 max-w-sm">Arahkan kamera ke QR code pada tiket peserta. Status kehadiran akan tercatat secara otomatis dan real-time.</p>
        
        <Link 
          href="/scanner" 
          className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-label-lg font-bold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[24px]">camera</span>
          Buka Kamera Scanner
        </Link>
      </div>
    </div>
  )
}
