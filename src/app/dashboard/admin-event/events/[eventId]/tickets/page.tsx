import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function TicketsPage(props: { params: Promise<{ eventId: string }> }) {
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

  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      participants ( full_name, email_normalized, organization )
    `)
    .eq('event_id', eventId)
    .order('issued_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Manajemen Tiket</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Daftar semua tiket yang telah diterbitkan</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-light">
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Guest ID</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Nama Peserta</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Diterbitkan Pada</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-[14px]">
              {tickets?.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border-light hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-primary font-medium">{ticket.guest_id}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-text-main">{ticket.participants?.full_name}</div>
                    <div className="text-text-muted text-[13px]">{ticket.participants?.email_normalized}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[12px] font-medium ${
                      ticket.ticket_status === 'active' ? 'bg-success/10 text-success border border-success/20' : 
                      'bg-error/10 text-error border border-error/20'
                    }`}>
                      {ticket.ticket_status === 'active' ? 'Aktif' : 'Dibatalkan'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted">
                    {new Date(ticket.issued_at).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              
              {(!tickets || tickets.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">Belum ada tiket diterbitkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
