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
  const { count: sentEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('status', 'sent')
  const { count: totalEmails } = await supabase.from('email_messages').select('*', { count: 'exact', head: true })

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

  // Recent Participants as "Audit Log" replacement
  const { data: recentParticipants } = await supabase
    .from('participants')
    .select('id, full_name, registered_at, events (name)')
    .order('registered_at', { ascending: false })
    .limit(4)

  const avgCheckinRate = totalRegistrations && totalRegistrations > 0 
    ? Math.round((totalAttendances || 0) / totalRegistrations * 100) 
    : 0

  const emailDeliveryRate = totalEmails && totalEmails > 0
    ? Math.round((sentEmails || 0) / totalEmails * 100)
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
    
    const countReg = recentRegs?.filter(r => new Date(r.registered_at) >= dayStart && new Date(r.registered_at) < dayEnd).length || 0
    const countAtt = recentAtts?.filter(a => new Date(a.checked_in_at) >= dayStart && new Date(a.checked_in_at) < dayEnd).length || 0
    
    registrations.push(countReg)
    attendances.push(countAtt)
  }

  const chartData = { labels, registrations, attendances }

  return (
    <div>
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] font-semibold text-primary">Dashboard Super Admin</h2>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Ringkasan performa sistem dan logistik acara terkini.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/super-admin/users/new" className="flex items-center gap-2 bg-surface text-secondary border border-secondary hover:bg-surface-container-low px-4 py-2 rounded-lg font-label-md text-[14px] font-semibold transition-colors">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Buat Akun Admin
          </Link>
          <Link href="/dashboard/super-admin/events/new" className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg font-label-md text-[14px] font-semibold shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Buat Event Baru
          </Link>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Total Event</p>
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-1.5 rounded-md text-[20px]">event_note</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">{totalEvents || 0}</h3>
            <p className="font-label-sm text-[12px] font-medium text-text-muted mt-2 flex items-center gap-1">
              Seluruh acara terdaftar
            </p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Event Aktif</p>
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-1.5 rounded-md text-[20px]">campaign</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">{activeEvents || 0}</h3>
            <p className="font-label-sm text-[12px] font-medium text-text-muted mt-2">Status Published</p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Total Registrasi</p>
            <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-fixed p-1.5 rounded-md text-[20px]">how_to_reg</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">
              {totalRegistrations ? (totalRegistrations > 1000 ? (totalRegistrations/1000).toFixed(1) + 'K' : totalRegistrations) : 0}
            </h3>
            <p className="font-label-sm text-[12px] font-medium text-success mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">groups</span> Peserta masuk
            </p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Total Kehadiran</p>
            <span className="material-symbols-outlined text-success bg-success/10 p-1.5 rounded-md text-[20px]">fact_check</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">
              {totalAttendances ? (totalAttendances > 1000 ? (totalAttendances/1000).toFixed(1) + 'K' : totalAttendances) : 0}
            </h3>
            <p className="font-label-sm text-[12px] font-medium text-text-muted mt-2">Avg. Check-in Rate: {avgCheckinRate}%</p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="font-label-md text-[14px] font-semibold text-text-muted">Email Delivery Rate</p>
            <span className="material-symbols-outlined text-primary bg-primary-fixed-dim/30 p-1.5 rounded-md text-[20px]">mark_email_read</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[36px] font-bold text-text-main">{emailDeliveryRate}%</h3>
            <p className="font-label-sm text-[12px] font-medium text-success mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> {totalEmails || 0} Terkirim
            </p>
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
        <div className="bg-surface p-6 rounded-xl border border-border-light shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <h3 className="font-headline-sm text-[20px] font-semibold text-text-main mb-4">Pendaftar Terkini</h3>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recentParticipants?.map((p: any) => {
              const eventName = Array.isArray(p.events) ? p.events[0]?.name : (p.events as any)?.name
              return (
                <div key={p.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-[14px] text-text-main"><span className="font-semibold">{p.full_name}</span> mendaftar di {eventName}</p>
                    <span className="font-label-sm text-[12px] text-text-muted">{new Date(p.registered_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )
            })}
            {(!recentParticipants || recentParticipants.length === 0) && (
              <div className="text-text-muted text-sm text-center py-4">Belum ada pendaftar</div>
            )}
          </div>
          <Link href="/dashboard/super-admin/participants" className="block text-center w-full mt-4 py-2 font-label-md text-[14px] font-semibold text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
            Lihat Semua Peserta
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
                        {event.location_name || '-'} • {new Date(event.start_time).toLocaleDateString('id-ID')}
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
                        <Link href={`/dashboard/events/${event.slug}`} className="p-1.5 text-text-muted hover:text-secondary rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">bar_chart</span></Link>
                        <Link href={`/dashboard/events/${event.slug}/edit`} className="p-1.5 text-text-muted hover:text-text-main rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></Link>
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
