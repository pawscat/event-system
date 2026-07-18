import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

import { ParticipantStatusFilter } from './participant-status-filter'

export const dynamic = 'force-dynamic'

export default async function ParticipantsPage(props: { params: Promise<{ eventId: string }>, searchParams: Promise<{ status?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { eventId } = params;
  const { status } = searchParams;
  
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

  let query = supabase
    .from('participants')
    .select(`
      *,
      events (name),
      tickets (ticket_status, qr_token_hash),
      attendances (checked_in_at)
    `)
    .order('registered_at', { ascending: false })

  query = query.eq('event_id', eventId)

  const { data: participants, error } = await query
  
  console.log('[Participants Page] Query Error:', error)
  console.log('[Participants Page] Participants:', participants)

  const { data: events } = await supabase
    .from('events')
    .select('id, name')
    .order('created_at', { ascending: false })

  let finalParticipants = participants || []
  if (status === 'hadir') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalParticipants = finalParticipants.filter((p: any) => {
      const attendance = Array.isArray(p.attendances) ? p.attendances[0] : p.attendances
      return !!attendance
    })
  } else if (status === 'belum-hadir') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalParticipants = finalParticipants.filter((p: any) => {
      const attendance = Array.isArray(p.attendances) ? p.attendances[0] : p.attendances
      return !attendance
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Peserta</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Kelola pendaftaran dan kehadiran peserta</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/v1/events/${eventId}/participants/export`} className="px-4 py-2 border border-border-light bg-surface-container-lowest text-text-main font-label-md text-[14px] font-semibold rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Ekspor
          </a>
          <Link href="/dashboard/admin-event/participants/import" className="px-4 py-2 border border-border-light bg-surface-container-lowest text-text-main font-label-md text-[14px] font-semibold rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Import
          </Link>
          <Link href="/dashboard/admin-event/participants/new" className="px-4 py-2 bg-secondary text-on-secondary font-label-md text-[14px] font-semibold rounded-lg hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Peserta
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-xl border border-border-light shadow-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-text-muted">search</span>
          <input className="w-full border-none bg-transparent focus:ring-0 p-0 text-body-md text-[16px] placeholder:text-text-muted outline-none" placeholder="Cari nama, email, Guest ID..." type="text" />
        </div>
        
        {/* Filter Status Kehadiran */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-border-light shadow-sm">
          <label className="text-label-sm text-[12px] font-medium text-text-muted block mb-1">Status Kehadiran</label>
          <ParticipantStatusFilter currentStatus={status} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-light">
                <th className="py-3 px-4 w-12 text-center">
                  <input className="rounded border-outline text-secondary focus:ring-secondary/50" type="checkbox" />
                </th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Peserta</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Acara / Kategori</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Status Tiket</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider">Kehadiran</th>
                <th className="py-3 px-4 text-label-sm text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-[14px]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {finalParticipants.map((participant: any) => {
                const ticket = participant.tickets
                const attendance = Array.isArray(participant.attendances) ? participant.attendances[0] : participant.attendances
                const isCheckedIn = !!attendance
                
                return (
                  <tr key={participant.id} className="border-b border-border-light hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-3 px-4 text-center">
                      <input className="rounded border-outline text-secondary focus:ring-secondary/50" type="checkbox" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-main">{participant.full_name}</div>
                      <div className="text-text-muted text-[13px]">{participant.email_normalized}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[13px] text-primary">{participant.events?.name}</div>
                      <div className="text-text-muted text-[13px]">{participant.organization || participant.job_title || 'Umum'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-[12px] font-medium bg-surface-variant text-on-surface-variant">
                        {ticket ? (ticket.ticket_status === 'active' ? 'Aktif' : 'Nonaktif') : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[12px] font-medium bg-success/10 text-success border border-success/20">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> Hadir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[12px] font-medium bg-surface-variant text-text-muted border border-border-light">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> Belum Hadir
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-text-muted hover:text-secondary hover:bg-secondary/10 rounded transition-colors" title="Kirim Ulang">
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                        <Link href={`/dashboard/admin-event/participants/${participant.id}/edit`} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {(!finalParticipants || finalParticipants.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">Belum ada data peserta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {participants && participants.length > 0 && (
          <div className="bg-surface border-t border-border-light p-4 flex items-center justify-between text-body-sm text-[14px]">
            <span className="text-text-muted">Menampilkan {participants.length} peserta</span>
            <div className="flex gap-1">
              <button className="p-1 text-text-muted hover:bg-surface-container-high rounded disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-on-secondary font-medium">1</button>
              <button className="p-1 text-text-muted hover:bg-surface-container-high rounded"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
