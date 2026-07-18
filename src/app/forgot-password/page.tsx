'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setStatus({
        type: 'success',
        message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk (atau folder spam) Anda.'
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Gagal mengirim email pemulihan. Pastikan email terdaftar.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background-subtle min-h-screen w-full flex items-center justify-center font-body-md text-text-main p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-light p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined text-[24px]">vpn_key</span>
          </div>
          <h1 className="font-headline-sm text-[24px] font-semibold text-text-main">Lupa Kata Sandi?</h1>
          <p className="text-body-sm text-text-muted mt-2 text-center">
            Masukkan alamat email admin Anda dan kami akan mengirimkan tautan untuk membuat kata sandi baru.
          </p>
        </div>

        {status && (
          <div className={`w-full mb-6 p-4 text-sm rounded-lg flex items-start gap-2 ${
            status.type === 'success' ? 'bg-success/10 text-success' : 'bg-error-container text-on-error-container'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {status.type === 'success' ? 'mark_email_read' : 'error'}
            </span>
            <span>{status.message}</span>
          </div>
        )}

        {!status || status.type === 'error' ? (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="email">Email Admin</label>
              <div className="relative input-focus-ring rounded-lg transition-shadow">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">mail</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-2.5 bg-surface border border-border-light rounded-lg font-body-md text-text-main placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
                  id="email"
                  type="email"
                  placeholder="admin@perusahaan.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-label-md text-[14px] font-semibold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
            </button>
          </form>
        ) : null}

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 font-label-sm text-[14px] font-semibold text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  )
}
