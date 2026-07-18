import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import AdminAccountsClient from './admin-accounts-client'
import { getUserAuthData } from '@/lib/actions/auth-actions'

export const dynamic = 'force-dynamic'

export default async function AdminAccountsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const authData = await getUserAuthData()
  const currentUserId = authData?.id

  // Fetch users and their assignments
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      role,
      status,
      created_at,
      event_staff_assignments!event_staff_assignments_user_id_fkey (
        id,
        role,
        status,
        event_id,
        events ( name )
      )
    `)
    .order('created_at', { ascending: false })

  // Format data for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedUsers = users?.map((u: any) => {
    // A user can have multiple assignments, but only one active according to our rule,
    // although they might have inactive ones. Let's just pass all assignments or find the active one.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeAssignment = Array.isArray(u.event_staff_assignments) 
      ? u.event_staff_assignments.find((a: any) => a.status === 'active')
      : null

    return {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      global_role: u.role, // 'super_admin' or 'admin'
      status: u.status,
      created_at: u.created_at,
      active_assignment: activeAssignment ? {
        id: activeAssignment.id,
        role: activeAssignment.role,
        event_id: activeAssignment.event_id,
        // Because of array responses for 1-to-many, we handle arrays or objects
        event_name: Array.isArray(activeAssignment.events) 
          ? activeAssignment.events[0]?.name 
          : activeAssignment.events?.name || 'Unknown Event'
      } : null,
      all_assignments: u.event_staff_assignments || []
    }
  }) || []

  // Fetch list of events for the assignment dropdown
  const { data: events } = await supabase
    .from('events')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-headline-md font-bold text-text-main">Manajemen Admin</h1>
          <p className="text-body-md text-text-muted mt-1">Kelola seluruh akun Admin dan penugasan event-nya</p>
        </div>
        <Link
          href="/dashboard/super-admin/admin-accounts/new"
          className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Tambah Admin
        </Link>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border-light overflow-hidden flex-1 flex flex-col">
        {error ? (
          <div className="p-8 text-center text-error">Gagal memuat data akun admin. Detail: {error.message}</div>
        ) : (
          <AdminAccountsClient initialUsers={formattedUsers} events={events || []} currentUserId={currentUserId || ''} />
        )}
      </div>
    </div>
  )
}
