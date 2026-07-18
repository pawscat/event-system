import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function EmailsPage(props: { params: Promise<{ eventId: string }> }) {
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

  const { data: emails } = await supabase
    .from('email_messages')
    .select(`
      id,
      recipient_email,
      message_type,
      status,
      subject,
      created_at,
      sent_at
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-light flex justify-between items-center">
        <div>
          <h2 className="font-headline-sm text-[20px] font-semibold text-text-main">Riwayat Email</h2>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Pantau status pengiriman email sistem untuk acara ini.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-border-light">
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Dibuat Pada</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Penerima</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Subjek / Tipe</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {emails && emails.length > 0 ? (
              emails.map((e: any) => {
                return (
                  <tr key={e.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-body-sm text-[14px] text-text-main">
                      {new Date(e.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-body-sm text-[14px] text-text-main">
                      {e.recipient_email}
                    </td>
                    <td className="p-4">
                      <p className="font-label-md text-[14px] font-semibold text-text-main">{e.subject}</p>
                      <p className="font-body-sm text-[12px] text-text-muted capitalize">{e.message_type}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md font-label-sm text-[12px] font-bold uppercase
                        ${e.status === 'sent' || e.status === 'delivered' ? 'bg-success/10 text-success' : 
                          e.status === 'queued' ? 'bg-warning/10 text-warning' : 
                          e.status === 'failed' ? 'bg-error/10 text-error' : 'bg-surface-container-highest text-text-muted'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted text-[14px]">Belum ada riwayat email.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
