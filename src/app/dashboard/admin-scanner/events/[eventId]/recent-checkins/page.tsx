import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function RecentCheckinsPage(props: { params: Promise<{ eventId: string }> }) {
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

  const { data: attendances } = await supabase
    .from('attendances')
    .select(`
      id,
      checked_in_at,
      method,
      participants ( full_name, organization, email_normalized ),
      tickets ( guest_id ),
      users ( full_name )
    `)
    .eq('event_id', eventId)
    .order('checked_in_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Riwayat Scan Terbaru</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">50 peserta terakhir yang berhasil check-in</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-light">
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Peserta</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Guest ID</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Waktu Check-in</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Metode & Petugas</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-[14px]">
              {attendances?.map((att) => {
                const participant = Array.isArray(att.participants) ? att.participants[0] : att.participants
                const ticket = Array.isArray(att.tickets) ? att.tickets[0] : att.tickets
                const user = Array.isArray(att.users) ? att.users[0] : att.users
                return (
                  <tr key={att.id} className="border-b border-border-light hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-main">{participant?.full_name}</div>
                      <div className="text-text-muted text-[13px]">{participant?.organization || 'Umum'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-primary font-medium">{ticket?.guest_id}</td>
                    <td className="py-3 px-4 text-text-main font-medium">
                      {new Date(att.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          att.method === 'qr' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning-dark'
                        }`}>
                          {att.method === 'qr' ? 'QR Scan' : 'Manual'}
                        </span>
                      </div>
                      <div className="text-text-muted text-[12px] mt-1 line-clamp-1" title={`Petugas: ${user?.full_name}`}>
                        {user?.full_name}
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {(!attendances || attendances.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">Belum ada riwayat check-in.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
