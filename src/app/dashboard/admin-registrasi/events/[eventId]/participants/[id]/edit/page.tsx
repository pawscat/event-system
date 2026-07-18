import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ParticipantForm } from '../../participant-form'

export default async function EditParticipantPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params
  
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

  const { data: participant, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !participant) {
    redirect('/dashboard/admin-registrasi/participants')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-body-sm text-[14px] text-text-muted mb-1 flex items-center gap-2">
            <Link href="/dashboard/admin-registrasi/participants" className="hover:text-secondary cursor-pointer">Peserta</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-text-main font-medium max-w-[200px] truncate">{participant.name}</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-text-main font-medium">Edit</span>
          </div>
          <h1 className="font-headline-lg text-[28px] font-semibold text-text-main">Edit Data Peserta</h1>
        </div>
      </div>

      <ParticipantForm initialData={participant} participantId={participant.id} />
    </div>
  )
}
