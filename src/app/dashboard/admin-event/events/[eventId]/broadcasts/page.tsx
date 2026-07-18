import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function CommunicationsPage() {
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

  // Fetch recent email messages
  const { data: messages } = await supabase
    .from('email_messages')
    .select(`
      id,
      recipient_email,
      message_type,
      status,
      queued_at,
      sent_at,
      participants (full_name),
      events (name)
    `)
    .order('queued_at', { ascending: false })
    .limit(50)

  // Fetch templates
  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Komunikasi</h1>
        <p className="text-body-sm text-[14px] text-text-muted mt-1">Kelola email antrean dan template pesan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Email */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-title-md text-[16px] font-semibold text-text-main">Status Pengiriman Terakhir</h2>
            <form action="/api/v1/jobs/process-emails" method="GET" target="_blank">
              <button type="submit" className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant text-text-main text-[13px] font-medium rounded transition-colors">
                Paksa Proses Antrean
              </button>
            </form>
          </div>
          
          <div className="bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-border-light">
                    <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Penerima</th>
                    <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Tipe</th>
                    <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Waktu</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-[14px]">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {messages?.map((msg: any) => {
                    const participant = Array.isArray(msg.participants) ? msg.participants[0] : msg.participants
                    const event = Array.isArray(msg.events) ? msg.events[0] : msg.events
                    return (
                      <tr key={msg.id} className="border-b border-border-light hover:bg-surface-container-low/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-text-main">{participant?.full_name || '-'}</div>
                          <div className="text-text-muted text-[13px]">{msg.recipient_email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[13px] text-text-muted capitalize">{msg.message_type}</span>
                          <div className="text-[12px] text-primary">{event?.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          {msg.status === 'sent' && <span className="inline-flex px-2 py-1 rounded text-[12px] font-medium bg-success/10 text-success border border-success/20">Terkirim</span>}
                          {msg.status === 'queued' && <span className="inline-flex px-2 py-1 rounded text-[12px] font-medium bg-warning/10 text-warning border border-warning/20">Antre</span>}
                          {msg.status === 'failed' && <span className="inline-flex px-2 py-1 rounded text-[12px] font-medium bg-error/10 text-error border border-error/20">Gagal</span>}
                        </td>
                        <td className="py-3 px-4 text-text-muted text-[13px]">
                          {new Date(msg.sent_at || msg.queued_at).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )
                  })}
                  {!messages || messages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted">Tidak ada riwayat email.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-title-md text-[16px] font-semibold text-text-main">Template Email</h2>
            <button className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          
          <div className="grid gap-3">
            {templates?.map(tpl => (
              <div key={tpl.id} className="bg-surface-container-lowest p-4 rounded-xl border border-border-light shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-text-muted">
                    {tpl.type.replace('_', ' ')}
                  </span>
                  <div className="flex gap-1">
                    <button className="text-text-muted hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  </div>
                </div>
                <h3 className="font-medium text-[15px] text-text-main mb-1">{tpl.name}</h3>
                <p className="text-[13px] text-text-muted line-clamp-2">Subjek: {tpl.subject}</p>
              </div>
            ))}
            {!templates || templates.length === 0 && (
              <div className="text-center p-4 text-text-muted text-sm border border-dashed border-border-light rounded-xl">
                Belum ada template
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
