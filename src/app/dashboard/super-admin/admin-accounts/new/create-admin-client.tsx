'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
}

export default function CreateAdminClient({ events }: { events: Event[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    account_type: 'event_specific', // 'event_specific' or 'super_admin'
    event_id: '',
    role: 'event_admin'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (formData.account_type === 'super_admin') {
        // Create Super Admin via Global Users API
        const res = await fetch('/api/v1/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            role: 'super_admin'
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal membuat Super Admin')
      } else {
        // Create Specific Admin and assign to Event
        if (!formData.event_id) throw new Error('Harap pilih event penugasan')
        
        const res = await fetch(`/api/v1/events/${formData.event_id}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal membuat Admin')
      }

      setSuccess('Akun Admin berhasil dibuat! Admin bisa langsung login menggunakan email dan password tersebut.')
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/super-admin/admin-accounts')
        router.refresh()
      }, 2500)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-error/10 text-error rounded-xl font-body-sm text-[14px]">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-success/10 text-success rounded-xl font-body-sm text-[14px]">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-md text-[14px] font-semibold text-text-main mb-2">Nama Lengkap</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full p-3 bg-surface-container-lowest border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-sm text-[14px]"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block font-label-md text-[14px] font-semibold text-text-main mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 bg-surface-container-lowest border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-sm text-[14px]"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block font-label-md text-[14px] font-semibold text-text-main mb-2">Password Sementara</label>
        <input
          type="text"
          required
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          className="w-full p-3 bg-surface-container-lowest border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-sm text-[14px]"
          placeholder="Minimal 6 karakter"
          minLength={6}
        />
        <p className="text-text-muted text-[12px] mt-1">Admin harus menggunakan password ini untuk login pertama kali.</p>
      </div>

      <div className="border-t border-border-light pt-6">
        <label className="block font-label-md text-[14px] font-semibold text-text-main mb-4">Jenis Akses Akun</label>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.account_type === 'event_specific' ? 'border-primary bg-primary/5' : 'border-border-light hover:bg-surface-container-lowest'}`}>
            <input 
              type="radio" 
              name="account_type" 
              value="event_specific" 
              checked={formData.account_type === 'event_specific'} 
              onChange={e => setFormData({...formData, account_type: e.target.value})}
              className="w-4 h-4 text-primary"
            />
            <div>
              <div className="font-semibold text-[14px]">Staf Spesifik Acara</div>
              <div className="text-[12px] text-text-muted">Hanya mengelola satu acara</div>
            </div>
          </label>
          <label className={`flex-1 flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.account_type === 'super_admin' ? 'border-primary bg-primary/5' : 'border-border-light hover:bg-surface-container-lowest'}`}>
            <input 
              type="radio" 
              name="account_type" 
              value="super_admin" 
              checked={formData.account_type === 'super_admin'} 
              onChange={e => setFormData({...formData, account_type: e.target.value})}
              className="w-4 h-4 text-primary"
            />
            <div>
              <div className="font-semibold text-[14px]">Super Admin</div>
              <div className="text-[12px] text-text-muted">Akses penuh ke semua sistem</div>
            </div>
          </label>
        </div>

        {formData.account_type === 'event_specific' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-xl border border-border-light">
            <div>
              <label className="block font-label-md text-[14px] font-semibold text-text-main mb-2">Pilih Acara</label>
              <select 
                required
                value={formData.event_id}
                onChange={e => setFormData({ ...formData, event_id: e.target.value })}
                className="w-full p-3 bg-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-sm text-[14px]"
              >
                <option value="">-- Pilih Acara --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-md text-[14px] font-semibold text-text-main mb-2">Role pada Acara</label>
              <select 
                required
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-3 bg-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-sm text-[14px]"
              >
                <option value="event_admin">Admin Acara (Bisa kelola fitur & peserta)</option>
                <option value="registration_admin">Admin Registrasi (Hanya meja pendaftaran)</option>
                <option value="scanner_admin">Admin Scanner (Hanya scan tiket)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              Menyimpan...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">save</span>
              Buat Akun
            </>
          )}
        </button>
      </div>
    </form>
  )
}
