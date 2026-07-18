import { redirect } from 'next/navigation'
import { getUserAuthData } from '@/lib/actions/auth-actions'

export default async function AdminEventRootPage() {
  const authData = await getUserAuthData()
  
  if (authData) {
    const assignment = authData.assignments.find(a => a.role === 'event_admin')
    if (assignment) {
      redirect(`/dashboard/admin-event/events/${assignment.event_id}/overview`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="bg-surface p-8 rounded-2xl border border-border-light shadow-sm max-w-md w-full">
        <span className="material-symbols-outlined text-[64px] text-danger mb-4">error</span>
        <h2 className="font-headline-md text-2xl font-bold text-text-main mb-2">Akses Ditolak</h2>
        <p className="text-body-md text-text-muted">
          Anda tidak memiliki tugas aktif sebagai Admin Event untuk acara mana pun saat ini.
        </p>
      </div>
    </div>
  )
}
