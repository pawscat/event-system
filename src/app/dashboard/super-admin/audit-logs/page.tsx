import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
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

  // Fetch audit logs with user info
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      created_at,
      ip_hash,
      events ( name ),
      users ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Helper to get styled badge for actions
  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return <span className="bg-success/10 text-success px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase">Create</span>
      case 'update':
      case 'edit':
      case 'modify':
        return <span className="bg-secondary/10 text-secondary px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase">Update</span>
      case 'delete':
      case 'remove':
        return <span className="bg-error/10 text-error px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase">Delete</span>
      case 'login':
        return <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase">Login</span>
      default:
        return <span className="bg-surface-container-highest text-text-main px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase">{action}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Audit Logs</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Lacak semua aktivitas sistem dan perubahan data secara global</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col">
        {error ? (
          <div className="p-8 text-center text-error bg-error/5">
            Gagal memuat log aktivitas. Detail: {error.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-border-light">
                  <th className="p-4 text-label-sm font-semibold text-text-muted">Waktu & Tanggal</th>
                  <th className="p-4 text-label-sm font-semibold text-text-muted">Aktor / Pengguna</th>
                  <th className="p-4 text-label-sm font-semibold text-text-muted">Aksi</th>
                  <th className="p-4 text-label-sm font-semibold text-text-muted">Entitas & Target</th>
                  <th className="p-4 text-label-sm font-semibold text-text-muted text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {logs && logs.length > 0 ? logs.map((log: any) => {
                  const user = Array.isArray(log.users) ? log.users[0] : log.users
                  const event = Array.isArray(log.events) ? log.events[0] : log.events
                  
                  return (
                    <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-text-main text-[14px]">
                          {new Date(log.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-text-muted text-[12px]">
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-text-main text-[14px]">{user?.full_name || 'Sistem / Guest'}</div>
                        <div className="text-text-muted text-[12px]">{user?.email || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-text-main text-[14px] uppercase tracking-wider text-xs">
                          {log.entity_type}
                        </div>
                        <div className="text-text-muted text-[12px] mt-0.5 truncate max-w-[200px]" title={log.entity_id}>
                          {event?.name ? `Event: ${event.name}` : `ID: ${log.entity_id || '-'}`}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-primary/10 transition-colors" title="Lihat Metadata (Akan datang)">
                          <span className="material-symbols-outlined text-[20px]">info</span>
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-text-muted italic">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-[48px] text-border-light">history</span>
                        <p>Belum ada rekaman log aktivitas.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
