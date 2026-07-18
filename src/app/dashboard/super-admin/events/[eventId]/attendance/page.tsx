import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AttendancePage(props: { params: Promise<{ eventId: string }> }) {
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
      checked_in_by,
      participants ( full_name, email, registration_code ),
      users ( full_name )
    `)
    .eq('event_id', eventId)
    .order('checked_in_at', { ascending: false })

  return (
    <div className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-light flex justify-between items-center">
        <div>
          <h2 className="font-headline-sm text-[20px] font-semibold text-text-main">Log Kehadiran</h2>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Daftar peserta yang telah melakukan check-in.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-border-light">
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Waktu Check-in</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Nama Peserta</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Kode Tiket</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Petugas Scanner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {attendances && attendances.length > 0 ? (
              attendances.map((a: any) => {
                const participant = Array.isArray(a.participants) ? a.participants[0] : a.participants
                const user = Array.isArray(a.users) ? a.users[0] : a.users
                return (
                  <tr key={a.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-body-sm text-[14px] text-text-main">
                      {new Date(a.checked_in_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <p className="font-label-md text-[14px] font-semibold text-text-main">{participant?.full_name}</p>
                      <p className="font-body-sm text-[12px] text-text-muted">{participant?.email}</p>
                    </td>
                    <td className="p-4 font-mono text-[14px] text-text-main">{participant?.registration_code}</td>
                    <td className="p-4 font-body-sm text-[14px] text-text-main">{user?.full_name || 'Sistem'}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted text-[14px]">Belum ada peserta yang check-in.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
