'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'admin'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      setSuccess('Akun Admin berhasil dibuat! Admin bisa langsung login menggunakan email dan password tersebut.')
      setFormData({ full_name: '', email: '', password: '', role: 'admin' })
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Buat Akun Admin</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Daftarkan akun staf baru untuk mengelola sistem.</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 border border-border-light rounded-lg text-text-main font-semibold hover:bg-surface-container-low transition-colors">
          Batal
        </Link>
      </div>

      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-border-light shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-[14px]">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2 text-success text-[14px]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-label-sm font-semibold text-text-main">Nama Lengkap</label>
            <input 
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm font-semibold text-text-main">Email</label>
            <input 
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
              placeholder="admin@eventku.id"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm font-semibold text-text-main">Kata Sandi (Password)</label>
            <input 
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
              placeholder="Minimal 6 karakter"
            />
            <p className="text-[12px] text-text-muted mt-1">Admin bisa langsung menggunakan kata sandi ini untuk login tanpa perlu konfirmasi email.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm font-semibold text-text-main">Peran (Role)</label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md bg-white"
            >
              <option value="admin">Admin Event (Biasa)</option>
              <option value="super_admin">Super Admin (Akses Penuh)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Memproses...</>
            ) : 'Buat Akun'}
          </button>
        </form>
      </div>
    </div>
  )
}
