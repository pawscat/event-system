import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function ReportsPage(props: { params: Promise<{ eventId: string }> }) {
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

  const { count: totalRegistrations } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
  const { count: totalAttendances } = await supabase.from('attendances').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
  const { count: totalEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
  const { count: sentEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('event_id', eventId).in('status', ['sent', 'delivered'])

  const attendanceRate = totalRegistrations && totalRegistrations > 0 ? Math.round(((totalAttendances || 0) / totalRegistrations) * 100) : 0
  
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-border-light shadow-sm p-6">
        <h2 className="font-headline-sm text-[20px] font-semibold text-text-main mb-4">Ringkasan Laporan Acara</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-border-light">
            <p className="font-label-sm text-[12px] text-text-muted">Total Peserta</p>
            <p className="font-display-sm text-[24px] font-bold text-text-main mt-1">{totalRegistrations || 0}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-border-light">
            <p className="font-label-sm text-[12px] text-text-muted">Total Check-in</p>
            <p className="font-display-sm text-[24px] font-bold text-text-main mt-1">{totalAttendances || 0}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-border-light">
            <p className="font-label-sm text-[12px] text-text-muted">Tingkat Kehadiran</p>
            <p className="font-display-sm text-[24px] font-bold text-text-main mt-1">{attendanceRate}%</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-border-light">
            <p className="font-label-sm text-[12px] text-text-muted">Email Terkirim</p>
            <p className="font-display-sm text-[24px] font-bold text-text-main mt-1">{sentEmails || 0} / {totalEmails || 0}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-text-muted text-[14px]">
            Fitur ekspor laporan lengkap (PDF/Excel) sedang dalam pengembangan.
          </p>
        </div>
      </div>
    </div>
  )
}
