'use client'

import { useState } from 'react'

export function RegistrationForm({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    jobTitle: '',
    privacyPolicy: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.privacyPolicy) {
      setError('Anda harus menyetujui Kebijakan Privasi.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/public/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || 'Terjadi kesalahan saat mendaftar.')
      }

      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-success text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h3 className="font-headline-md text-[24px] font-semibold text-text-main mb-2">Pendaftaran Berhasil!</h3>
          <p className="font-body-md text-[16px] text-text-muted max-w-md mx-auto mb-8">
            Terima kasih telah mendaftar. E-Tiket dan informasi lebih lanjut mengenai acara telah dikirimkan ke email Anda.
          </p>
          <button 
            className="px-6 py-2.5 rounded-lg border border-primary text-primary font-label-md hover:bg-primary/5 transition-colors"
            onClick={() => {
              setSuccess(false)
              setFormData({ ...formData, fullName: '', email: '', phone: '', institution: '', jobTitle: '', privacyPolicy: false })
            }}
          >
            Daftar Peserta Lain
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="font-headline-md text-[24px] font-semibold text-text-main mb-2">Formulir Pendaftaran</h2>
        <p className="font-body-sm text-[14px] text-text-muted mb-8">Lengkapi data diri Anda di bawah ini untuk mengamankan kursi Anda. Pastikan email dan nomor telepon aktif untuk menerima tiket elektronik.</p>
        
        {error && (
          <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-sm rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="fullName">Nama Lengkap <span className="text-danger">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">person</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  id="fullName" 
                  required 
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="email">Alamat Email <span className="text-danger">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">mail</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  id="email" 
                  required 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="phone">Nomor Telepon <span className="text-danger">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">phone</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  id="phone" 
                  required 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="institution">Instansi / Perusahaan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">business</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  id="institution" 
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="jobTitle">Jabatan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">work</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  id="jobTitle" 
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-light mt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input 
                  className="w-5 h-5 border-2 border-outline-variant rounded bg-surface checked:bg-primary checked:border-primary appearance-none peer cursor-pointer" 
                  id="privacyPolicy" 
                  required 
                  type="checkbox"
                  checked={formData.privacyPolicy}
                  onChange={(e) => setFormData({...formData, privacyPolicy: e.target.checked})}
                  disabled={loading}
                />
                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-primary text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <span className="font-body-sm text-[14px] text-text-muted leading-tight group-hover:text-text-main transition-colors">
                Saya menyetujui bahwa data yang saya berikan akan disimpan dan diproses sesuai dengan Kebijakan Privasi untuk keperluan penyelenggaraan acara ini.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
            <button 
              className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70" 
              type="submit"
              disabled={loading}
            >
              {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              <span>Kirim Pendaftaran</span>
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
