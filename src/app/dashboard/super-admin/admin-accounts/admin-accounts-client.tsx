'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Assignment {
  id: string
  role: string
  event_id: string
  event_name: string
}

interface User {
  id: string
  email: string
  full_name: string
  global_role: string
  status: string
  created_at: string
  active_assignment: Assignment | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all_assignments: any[]
}

interface Event {
  id: string
  name: string
}

export default function AdminAccountsClient({ initialUsers, events, currentUserId }: { initialUsers: User[], events: Event[], currentUserId: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Reassignment states
  const [newRole, setNewRole] = useState('')
  const [newEventId, setNewEventId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAssign = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.active_assignment?.role || 'event_admin')
    setNewEventId(user.active_assignment?.event_id || '')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedUser) return
    if (selectedUser.global_role === 'super_admin') {
      setErrorMsg('Super Admin tidak perlu di-assign ke event tertentu.')
      return
    }
    if (!newEventId || !newRole) {
      setErrorMsg('Harap lengkapi Role dan Event.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')
    
    try {
      // First, if there's an active assignment, we must deactivate it if they are switching events
      if (selectedUser.active_assignment && selectedUser.active_assignment.event_id !== newEventId) {
         // This logic requires a backend endpoint to deactivate assignment.
         // Or our `POST /api/v1/events/[eventId]/team` could handle switching if the user already has one.
         // But currently `POST` returns 409 if they have an active assignment elsewhere.
         // So we MUST DELETE the old assignment first!
         const delRes = await fetch(`/api/v1/events/${selectedUser.active_assignment.event_id}/team/${selectedUser.active_assignment.id}`, {
           method: 'DELETE'
         })
         if (!delRes.ok) throw new Error('Gagal menonaktifkan assignment lama')
      }

      // If they just changed roles in the same event, or if we deleted the old one, we create new
      // Wait, if they are in the same event and same role, just close.
      if (selectedUser.active_assignment && 
          selectedUser.active_assignment.event_id === newEventId && 
          selectedUser.active_assignment.role === newRole) {
          setIsModalOpen(false)
          setIsSubmitting(false)
          return
      }

      // If they changed roles in the SAME event, we also need to delete the old one or UPDATE.
      // Our API doesn't have a PUT yet for just changing roles, so we DELETE then POST.
      if (selectedUser.active_assignment && selectedUser.active_assignment.event_id === newEventId && selectedUser.active_assignment.role !== newRole) {
         const delRes = await fetch(`/api/v1/events/${selectedUser.active_assignment.event_id}/team/${selectedUser.active_assignment.id}`, {
           method: 'DELETE'
         })
         if (!delRes.ok) throw new Error('Gagal memperbarui assignment lama')
      }

      // Create new assignment
      const postRes = await fetch(`/api/v1/events/${newEventId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser.email,
          full_name: selectedUser.full_name,
          role: newRole
        })
      })

      if (!postRes.ok) {
        const err = await postRes.json()
        throw new Error(err.error || 'Gagal menugaskan admin')
      }

      // Refresh UI by reloading page for simplicity
      window.location.reload()

    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAssignment = async (user: User) => {
    if (!user.active_assignment) return
    if (!confirm('Cabut penugasan admin ini?')) return

    try {
      const res = await fetch(`/api/v1/events/${user.active_assignment.event_id}/team/${user.active_assignment.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Gagal mencabut assignment')
      window.location.reload()
    } catch (e) {
      alert(e)
    }
  }

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUserId) return

    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    if (!confirm(`Apakah Anda yakin ingin ${newStatus === 'active' ? 'mengaktifkan' : 'menonaktifkan'} akun ${user.full_name}?`)) return
    
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', user.id)

      if (error) throw error

      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ))
    } catch (err: any) {
      alert(err?.message || 'Gagal mengubah status akun.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUserId) return

    if (!confirm(`PERINGATAN: Apakah Anda yakin ingin MENGHAPUS PERMANEN akun ${user.full_name}? Aksi ini tidak dapat dibatalkan.`)) return
    
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Gagal menghapus akun.')
      }

      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (err: any) {
      alert(err?.message || 'Terjadi kesalahan sistem saat menghapus akun.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatRole = (globalRole: string, assignment: Assignment | null) => {
    if (globalRole === 'super_admin') return 'Super Admin'
    if (!assignment) return 'Admin (Belum Bertugas)'
    if (assignment.role === 'event_admin') return 'Admin Event'
    if (assignment.role === 'registration_admin') return 'Admin Registrasi'
    if (assignment.role === 'scanner_admin') return 'Admin Scanner'
    return assignment.role
  }

  return (
    <>
      <div className="p-4 border-b border-border-light flex justify-between items-center bg-white">
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
          <input
            type="text"
            placeholder="Cari admin..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-sm text-[14px]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Nama</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Role</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Event Aktif</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted">Status Akun</th>
              <th className="p-4 font-label-md text-[14px] font-semibold text-text-muted text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-text-main text-[14px]">
                    {user.full_name} 
                    {user.id === currentUserId && <span className="text-secondary italic font-normal text-[12px] ml-1">(Anda)</span>}
                  </div>
                  <div className="text-text-muted text-[12px]">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                    user.global_role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {formatRole(user.global_role, user.active_assignment)}
                  </span>
                </td>
                <td className="p-4">
                  {user.global_role === 'super_admin' ? (
                    <span className="text-text-muted text-[13px] italic">Semua Event (Global)</span>
                  ) : user.active_assignment ? (
                    <span className="font-medium text-text-main text-[13px]">{user.active_assignment.event_name}</span>
                  ) : (
                    <span className="text-text-muted text-[13px] italic">Tidak ada event aktif</span>
                  )}
                </td>
                <td className="p-4">
                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                    user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-error'}`}></span>
                    {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-1.5 text-text-muted hover:text-primary rounded hover:bg-surface-container-high transition-colors"
                      title="Edit Profil Admin (Dalam Pengembangan)"
                      onClick={() => alert('Fitur edit profil masih dalam pengembangan.')}
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>

                      {user.id !== currentUserId && (
                        <button
                          className="p-1.5 text-text-muted hover:text-error rounded hover:bg-surface-container-high transition-colors"
                          title={user.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          onClick={() => handleToggleStatus(user)}
                          disabled={isSubmitting}
                        >
                          <span className="material-symbols-outlined text-[20px]">{user.status === 'active' ? 'block' : 'check_circle'}</span>
                        </button>
                      )}

                      {user.id !== currentUserId && (
                        <button
                          className="p-1.5 text-text-muted hover:text-error rounded hover:bg-surface-container-high transition-colors"
                          title="Hapus Akun Permanen"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isSubmitting}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}

                      {user.global_role !== 'super_admin' && (
                      <>
                        <button 
                          onClick={() => handleOpenAssign(user)}
                          className="p-1.5 text-text-muted hover:text-primary rounded hover:bg-surface-container-high transition-colors"
                          title="Tugaskan ke Event"
                        >
                          <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                        </button>
                        {user.active_assignment && (
                          <button 
                            onClick={() => handleDeleteAssignment(user)}
                            className="p-1.5 text-text-muted hover:text-error rounded hover:bg-surface-container-high transition-colors"
                            title="Cabut Penugasan"
                          >
                            <span className="material-symbols-outlined text-[20px]">person_remove</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-8 text-text-muted">Tidak ada admin yang sesuai pencarian.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-lg p-6">
            <h3 className="text-headline-sm font-semibold mb-4">Ubah Penugasan Admin</h3>
            <p className="text-body-sm text-text-muted mb-6">
              Mengubah penugasan untuk <strong>{selectedUser.full_name}</strong>. Jika ia sedang aktif di event lain, ia akan dipindahkan secara otomatis.
            </p>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-error/10 text-error text-[13px] rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-label-md text-[14px] font-semibold mb-2">Event</label>
                <select 
                  className="w-full p-2.5 bg-surface-container-lowest border border-border-light rounded-lg text-[14px]"
                  value={newEventId}
                  onChange={e => setNewEventId(e.target.value)}
                >
                  <option value="">-- Pilih Event --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-md text-[14px] font-semibold mb-2">Role pada Event</label>
                <select 
                  className="w-full p-2.5 bg-surface-container-lowest border border-border-light rounded-lg text-[14px]"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                >
                  <option value="event_admin">Admin Event</option>
                  <option value="registration_admin">Admin Registrasi</option>
                  <option value="scanner_admin">Admin Scanner</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg font-semibold text-text-main bg-surface-container-high hover:bg-surface-container-highest transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleAssign}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-semibold text-on-primary bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
