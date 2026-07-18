'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'


interface User {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-headline-md font-bold text-text-main">Admin & Staf</h1>
          <p className="text-body-md text-text-muted mt-1">Kelola akses untuk Super Admin dan Event Admin</p>
        </div>
        <Link
          href="/dashboard/super-admin/users/new"
          className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Tambah Admin
        </Link>
      </div>

      <div className="bg-surface border border-border-light rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Memuat data admin...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-text-muted">Belum ada data admin.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-border-light text-label-md text-text-muted">
                  <th className="p-4 font-semibold">Nama Lengkap</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Dibuat Pada</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-text-main divide-y divide-border-light">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-semibold">{user.full_name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-label-sm font-semibold ${
                        user.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-text-main'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Event Admin'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                        user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-error'}`}></span>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
