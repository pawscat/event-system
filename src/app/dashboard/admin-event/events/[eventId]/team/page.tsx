'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface TeamMember {
  id: string
  role: string
  status: string
  assigned_at: string
  users: {
    id: string
    email: string
    full_name: string
    status: string
  }
}

export default function TeamManagementPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'registration_admin'
  })

  useEffect(() => {
    fetchTeam()
  }, [eventId])

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/v1/events/${eventId}/team`)
      if (!res.ok) throw new Error('Failed to fetch team')
      const data = await res.json()
      setTeam(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`/api/v1/events/${eventId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan')

      setSuccess('Admin berhasil ditugaskan.')
      setIsAdding(false)
      setForm({ email: '', full_name: '', password: '', role: 'registration_admin' })
      fetchTeam()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (assignmentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan assignment ini?')) return

    try {
      setLoading(true)
      const res = await fetch(`/api/v1/events/${eventId}/team/${assignmentId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menonaktifkan')

      setSuccess('Assignment dinonaktifkan.')
      fetchTeam()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-sm font-semibold text-text-main">Manajemen Tim Acara</h1>
          <p className="text-body-sm text-text-muted mt-1">Kelola admin registrasi dan scanner untuk acara ini.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          {isAdding ? 'Batal' : 'Tambah Admin'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-body-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success text-body-sm">
          {success}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm space-y-4">
          <h3 className="font-headline-sm text-lg font-semibold text-text-main">Tugaskan Admin Baru</h3>
          <p className="text-body-sm text-text-muted mb-4">Jika email sudah terdaftar, ia akan otomatis ditugaskan. Jika belum, akun baru akan dibuat (password diperlukan).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-semibold text-text-main mb-1">Email</label>
              <input 
                type="email" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border-light focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-label-md font-semibold text-text-main mb-1">Nama Lengkap</label>
              <input 
                type="text" required
                value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border-light focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-label-md font-semibold text-text-main mb-1">Role</label>
              <select 
                value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border-light focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="registration_admin">Admin Registrasi</option>
                <option value="scanner_admin">Admin Scanner</option>
              </select>
            </div>
            <div>
              <label className="block text-label-md font-semibold text-text-main mb-1">Password (Bila Akun Baru)</label>
              <input 
                type="password"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border-light focus:ring-2 focus:ring-primary outline-none"
                placeholder="Kosongkan jika user sudah ada"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50">
              {loading ? 'Memproses...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface-container-lowest rounded-xl border border-border-light shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-border-light text-label-md text-text-muted">
              <th className="px-6 py-4 font-semibold">Nama & Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status Assignment</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && team.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-text-muted">Memuat data...</td></tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-text-muted">Belum ada tim yang ditugaskan.</td></tr>
            ) : (
              team.map(member => (
                <tr key={member.id} className="border-b border-border-light hover:bg-surface-container-low/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-text-main">{member.users.full_name}</p>
                    <p className="text-body-sm text-text-muted">{member.users.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-semibold">
                      {member.role === 'event_admin' ? 'Event Admin' : member.role === 'registration_admin' ? 'Registrasi' : 'Scanner'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                      member.status === 'active' ? 'bg-success/10 text-success' : 'bg-surface-container-high text-text-muted'
                    }`}>
                      {member.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member.status === 'active' && member.role !== 'event_admin' && (
                      <button 
                        onClick={() => handleDeactivate(member.id)}
                        className="text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors"
                      >
                        Nonaktifkan
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
