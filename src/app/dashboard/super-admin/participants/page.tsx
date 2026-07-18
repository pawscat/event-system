import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function GlobalParticipantsPage() {
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

  // Fetch all participants and their event name using foreign key relationship
  const { data: participants, error } = await supabase
    .from('participants')
    .select('*, event:events(name, slug), ticket:tickets(ticket_status)')
    .order('registered_at', { ascending: false })

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">Peserta Global</h1>
          <p className="font-body-sm text-[14px] text-text-muted mt-1">Pantau seluruh pendaftar dari berbagai event aktif di platform Anda.</p>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-surface-container-lowest border border-border-light rounded-xl shadow-sm overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-error">Gagal memuat data peserta.</div>
        ) : participants && participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-border-light text-label-md text-[14px] text-text-muted font-semibold">
                  <th className="p-4">Nama Peserta</th>
                  <th className="p-4">Kontak</th>
                  <th className="p-4">Asal Event</th>
                  <th className="p-4">Status Check-in</th>
                  <th className="p-4">Waktu Daftar</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-[14px] text-text-main divide-y divide-border-light">
                {participants.map((p) => {
                  // Safely access event title depending on how supabase returns array vs object
                  // If it's a 1-to-many relationship, event might be an array or object.
                  const eventData = Array.isArray(p.event) ? p.event[0] : p.event
                  
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4">
                        <div className="font-semibold">{p.full_name}</div>
                        <div className="text-text-muted text-[12px]">{p.organization} - {p.job_title}</div>
                      </td>
                      <td className="p-4">
                        <div>{p.email_normalized}</div>
                        <div className="text-text-muted">{p.phone_number}</div>
                      </td>
                      <td className="p-4">
                        {eventData ? (
                          <Link href={`/dashboard/super-admin/events/${eventData.slug}/overview`} className="text-secondary hover:underline font-medium">
                            {eventData.name}
                          </Link>
                        ) : (
                          <span className="text-text-muted italic">Event Tidak Diketahui</span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.ticket?.[0]?.ticket_status === 'checked_in' || p.ticket?.ticket_status === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-success/10 text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                            Sudah Hadir
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-surface-container-highest text-text-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                            Belum Hadir
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-text-muted">
                        {new Date(p.registered_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-text-muted text-3xl">groups</span>
            </div>
            <h3 className="font-headline-sm text-[20px] font-semibold text-text-main mb-1">Belum Ada Pendaftar</h3>
            <p className="text-body-sm text-[14px] text-text-muted max-w-md">Saat ini belum ada peserta yang terdaftar di event manapun dalam sistem Anda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
