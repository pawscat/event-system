import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import CreateAdminClient from './create-admin-client'

export const dynamic = 'force-dynamic'

export default async function NewAdminAccountsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // Fetch list of active events
  const { data: events } = await supabase
    .from('events')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="w-full h-full flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/super-admin/admin-accounts" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-text-main"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-headline-md font-bold text-text-main">Tambah Akun Admin</h1>
          <p className="text-body-md text-text-muted mt-1">Buat akun staf baru dan atur penugasannya</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border-light p-8">
        <CreateAdminClient events={events || []} />
      </div>
    </div>
  )
}
