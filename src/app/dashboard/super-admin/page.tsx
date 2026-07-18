import Link from 'next/link'
import Image from 'next/image'
import { DashboardTrendChart } from '@/components/dashboard/dashboard-trend-chart'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
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
  const { count: activeEvents } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published')
  const { count: totalRegistrations } = await supabase.from('participants').select('*', { count: 'exact', head: true })
  const { count: totalAttendances } = await supabase.from('attendances').select('*', { count: 'exact', head: true })

  // Email status counts
  const { count: queuedEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('status', 'queued')
  const { count: sentEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('status', 'sent')
  const { count: deliveredEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('status', 'delivered')
  const { count: failedEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('status', 'failed')
  
  const totalEmails = (queuedEmails || 0) + (sentEmails || 0) + (deliveredEmails || 0) + (failedEmails || 0)

  // Active events for the table
  const { data: topEvents } = await supabase
    .from('events')
    .select(`
      id,
      name,
      slug,
      venue,
      start_at,
      status,
      participants (count),
      attendances (count)
    `)
    .eq('status', 'published')
    .order('start_at', { ascending: true })
    .limit(5)

  // Recent Audit Logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      created_at,
      users ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Operational Issues Check
  const operationalIssues = []
  if (failedEmails && failedEmails > 0) {
    operationalIssues.push({
      type: 'email',
      message: `Terdapat ${failedEmails} email yang gagal terkirim.`,
      actionLink: '/dashboard/super-admin/global-reports'
    })
  }

  // Fetch active events and their assignments to check for missing admins.
  // We can just query `events` and check if they have `event_staff_assignments` where role is `event_admin`.
  // Supabase doesn't easily let us filter by "does NOT have relation" using PostgREST without NOT IN or doing two queries.
  // For now, we'll fetch all active events and their assignments to check.
  const { data: activeEventsData } = await supabase
    .from('events')
    .select('id, name, event_staff_assignments(role)')
    .eq('status', 'published')
  
  const missingAdminCount = activeEventsData?.filter(e => 
    !e.event_staff_assignments || !e.event_staff_assignments.some((a: any) => a.role === 'event_admin')
  ).length || 0

  if (missingAdminCount > 0) {
    operationalIssues.push({
      type: 'staff',
      message: `Terdapat ${missingAdminCount} event aktif tanpa Event Admin.`,
      actionLink: '/dashboard/super-admin/admin-accounts'
    })
  }

  const avgCheckinRate = totalRegistrations && totalRegistrations > 0 
    ? Math.round((totalAttendances || 0) / totalRegistrations * 100) 
    : 0

  // Chart data based on last 30 days
  const { data: recentRegs } = await supabase
    .from('participants')
    .select('registered_at')
    // eslint-disable-next-line react-hooks/purity
    .gte('registered_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { data: recentAtts } = await supabase
    .from('attendances')
    .select('checked_in_at')
    // eslint-disable-next-line react-hooks/purity
    .gte('checked_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const labels = []
  const registrations = []
  const attendances = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 4) 
    labels.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))
    
    const dayStart = new Date(d)
    dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(d)
    dayEnd.setDate(dayEnd.getDate() + 4)
    dayEnd.setHours(23,59,59,999)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const regsInPeriod = recentRegs?.filter((r: any) => {
      const rd = new Date(r.registered_at)
      return rd >= dayStart && rd <= dayEnd
    }).length || 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attsInPeriod = recentAtts?.filter((a: any) => {
      const ad = new Date(a.checked_in_at)
      return ad >= dayStart && ad <= dayEnd
    }).length || 0

    registrations.push(regsInPeriod)
    attendances.push(attsInPeriod)
  }

  const chartData = {
    labels,
    registrations,
    attendances
  }

  return (
    <div className="w-full">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] font-semibold text-primary">Dashboard Super Admin</h2>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Ringkasan global, metrik acara, dan status sistem.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/super-admin/admin-accounts/new" className="flex items-center gap-2 bg-surface text-secondary border border-secondary hover:bg-surface-container-low px-4 py-2 rounded-lg font-label-md text-[14px] font-semibold transition-colors">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Tambah Admin
          </Link>
          <Link href="/dashboard/super-admin/events/new" className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg font-label-md text-[14px] font-semibold shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Buat Event
          </Link>
        </div>
      </div>

      {operationalIssues.length > 0 && (
        <div className="mb-8 space-y-3">
          {operationalIssues.map((issue, idx) => (
            <div key={idx} className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined">warning</span>
                <span className="font-semibold text-[14px]">{issue.message}</span>
              </div>
              <Link href={issue.actionLink} className="text-error underline text-[14px] font-medium hover:text-error/80 transition-colors">
                Lihat Detail
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Total / Aktif Event</p>
            <span className="material-symbols-outlined text-primary bg-primary-fixed-dim/30 p-1.5 rounded-md text-[20px]">event</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">{totalEvents || 0}</h3>
            <p className="font-label-sm text-[12px] font-medium text-success mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> {activeEvents || 0} Aktif saat ini
            </p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Peserta Global</p>
            <span className="material-symbols-outlined text-secondary bg-secondary-container p-1.5 rounded-md text-[20px]">group</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">
              {new Intl.NumberFormat('id-ID').format(totalRegistrations || 0)}
            </h3>
            <p className="font-label-sm text-[12px] font-medium text-text-muted mt-2 flex items-center gap-1">
              Akumulasi dari seluruh event
            </p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Avg Attendance Rate</p>
            <span className="material-symbols-outlined text-[#10B981] bg-[#10B981]/10 p-1.5 rounded-md text-[20px]">how_to_reg</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">{avgCheckinRate}%</h3>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-3">
              <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: `${avgCheckinRate}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Status Email (All)</p>
            <span className="material-symbols-outlined text-[#F59E0B] bg-[#F59E0B]/10 p-1.5 rounded-md text-[20px]">mark_email_read</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-bold text-text-main">{new Intl.NumberFormat('id-ID').format(totalEmails)}</h3>
            <div className="flex items-center gap-2 mt-2 text-[11px] font-medium">
              <span className="text-success">{deliveredEmails || 0} Dlv</span>
              <span className="text-primary">{sentEmails || 0} Snt</span>
              <span className="text-warning">{queuedEmails || 0} Qu</span>
              <span className="text-error">{failedEmails || 0} Fail</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <h3 className="font-headline-sm text-[20px] font-semibold text-text-main mb-4">Tren Registrasi vs Kehadiran (30 Hari Terakhir)</h3>
          <div className="h-64 w-full relative">
            <DashboardTrendChart chartData={chartData} />
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-sm text-[20px] font-semibold text-text-main">Log Audit Terkini</h3>
          </div>
          <div className="space-y-4 flex-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {auditLogs?.map((log: any) => (
              <div key={log.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-text-muted">history</span>
                </div>
                <div>
                  <p className="font-body-sm text-[13px] text-text-main">
                    <span className="font-semibold">{Array.isArray(log.users) ? log.users[0]?.full_name : log.users?.full_name || 'Unknown'}</span> melakukan <span className="font-medium text-secondary">{log.action}</span> pada {log.entity_type}.
                  </p>
                  <span className="font-label-sm text-[11px] text-text-muted">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
            {(!auditLogs || auditLogs.length === 0) && (
              <div className="text-text-muted text-sm text-center py-4">Belum ada log aktivitas</div>
            )}
          </div>
          <Link href="/dashboard/super-admin/audit-logs" className="block text-center w-full mt-4 py-2 font-label-md text-[14px] font-semibold text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
            Lihat Semua Log
          </Link>
        </div>
      </div>

      {/* Data Table: Performa Event */}
      <div className="bg-surface rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-6 border-b border-border-light flex justify-between items-center">
          <h3 className="font-headline-sm text-[20px] font-semibold text-text-main">Performa Event Aktif</h3>
          <Link href="/dashboard/super-admin/events" className="font-label-md text-[14px] font-semibold text-text-muted hover:text-text-main flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">list</span> Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="p-3 font-label-md text-[14px] font-semibold text-text-muted">Banner</th>
                <th className="p-3 font-label-md text-[14px] font-semibold text-text-muted">Nama Event</th>
                <th className="p-3 font-label-md text-[14px] font-semibold text-text-muted">Registrasi</th>
                <th className="p-3 font-label-md text-[14px] font-semibold text-text-muted">Checked-in</th>
                <th className="p-3 font-label-md text-[14px] font-semibold text-text-muted">Attendance Rate</th>
                <th className="p-3 font-label-md text-[14px] font-semibold text-text-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {topEvents?.map((event: any) => {
                const countReg = Array.isArray(event.participants) ? event.participants[0]?.count : event.participants?.count || 0
                const countAtt = Array.isArray(event.attendances) ? event.attendances[0]?.count : event.attendances?.count || 0
                const rate = countReg > 0 ? Math.round((countAtt / countReg) * 100) : 0
                
                return (
                  <tr key={event.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3">
                      <div className="w-16 h-10 rounded bg-surface-container-high overflow-hidden relative flex items-center justify-center">
                        {event.banner_image_url ? (
                          <img 
                            src={event.banner_image_url}
                            alt="Banner"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-text-muted">image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-label-md text-[14px] font-semibold text-text-main">{event.name}</p>
                      <p className="font-body-sm text-[12px] text-text-muted">
                        {event.venue || '-'} ? {new Date(event.start_at).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="p-3 font-body-sm text-[14px] text-text-main">{countReg}</td>
                    <td className="p-3 font-body-sm text-[14px] text-text-main">{countAtt}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-surface-container-high rounded-full h-2 max-w-[80px]">
                          <div className={`h-2 rounded-full ${rate > 50 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${rate}%` }}></div>
                        </div>
                        <span className="font-label-sm text-[12px] font-semibold text-text-main">{rate}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/super-admin/events/${event.id}/overview`} className="p-1.5 text-text-muted hover:text-secondary rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">bar_chart</span></Link>
                        <Link href={`/dashboard/super-admin/events/${event.id}/settings`} className="p-1.5 text-text-muted hover:text-text-main rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!topEvents || topEvents.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-text-muted text-sm">Tidak ada event aktif.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
