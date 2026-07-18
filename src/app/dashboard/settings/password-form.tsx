'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Kata sandi minimal 6 karakter.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' })
      setPassword('')
      setConfirmPassword('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Terjadi kesalahan saat memperbarui kata sandi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm">
      <h2 className="text-title-md font-semibold text-text-main mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-text-muted">manage_accounts</span>
        Profil Akun & Kata Sandi
      </h2>
      <p className="text-body-md text-text-muted mb-6">
        Pastikan akun Anda aman dengan menggunakan kata sandi yang kuat (minimal 6 karakter).
      </p>

      {message && (
        <div className={`w-full mb-6 p-4 text-sm rounded-lg flex items-start gap-2 ${
          message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error-container text-on-error-container'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
        <div className="space-y-1">
          <label className="block text-label-sm font-semibold text-text-main">Kata Sandi Baru</label>
          <input 
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none"
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-label-sm font-semibold text-text-main">Konfirmasi Kata Sandi</label>
          <input 
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none"
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-on-primary font-label-md font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'Memperbarui...' : 'Ubah Kata Sandi'}
        </button>
      </form>
    </div>
  )
}
