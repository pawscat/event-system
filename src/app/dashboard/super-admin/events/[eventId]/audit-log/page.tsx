import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function AuditLogPage(props: { params: Promise<{ eventId: string }> }) {
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

  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      details,
      ip_address,
      created_at,
      users ( full_name, email )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-surface rounded-xl border border-border-light shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-light flex justify-between items-center">
        <div>
          <h2 className="font-headline-sm text-[20px] font-semibold text-text-main">Audit Log Acara</h2>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Jejak aktivitas dan perubahan data untuk acara ini.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-border-light">
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Waktu</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Aktor</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Aksi</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Target (Entity)</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {logs && logs.length > 0 ? (
              logs.map((log: any) => {
                const user = Array.isArray(log.users) ? log.users[0] : log.users
                return (
                  <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-body-sm text-[14px] text-text-main">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <p className="font-label-md text-[14px] font-semibold text-text-main">{user?.full_name || 'Sistem'}</p>
                      <p className="font-body-sm text-[12px] text-text-muted">{user?.email || '-'}</p>
                    </td>
                    <td className="p-4 font-label-sm text-[13px] font-semibold text-secondary uppercase tracking-wider">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <p className="font-label-md text-[14px] font-semibold text-text-main capitalize">{log.entity_type}</p>
                      <p className="font-body-sm text-[11px] font-mono text-text-muted truncate max-w-[150px]">{log.entity_id}</p>
                    </td>
                    <td className="p-4 font-body-sm text-[13px] text-text-muted">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted text-[14px]">Belum ada aktivitas yang tercatat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
