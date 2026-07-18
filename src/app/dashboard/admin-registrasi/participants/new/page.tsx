import { ParticipantForm } from '../participant-form'
import Link from 'next/link'

export default function NewParticipantPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-body-sm text-[14px] text-text-muted mb-1 flex items-center gap-2">
            <Link href="/dashboard/admin-registrasi/participants" className="hover:text-secondary cursor-pointer">Peserta</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-text-main font-medium">Tambah Manual</span>
          </div>
          <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">Tambah Peserta Manual</h1>
        </div>
      </div>

      <ParticipantForm />
    </div>
  )
}
