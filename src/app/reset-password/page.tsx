'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isReady, setIsReady] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setStatus(null)
      } else {
        setStatus({
          type: 'error',
          message: 'Sesi tidak valid atau telah kedaluwarsa. Silakan minta tautan pemulihan baru.'
        })
      }
      setIsReady(true)
    })

    // Initial check (in case onAuthStateChange doesn't fire immediately for already logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus(null)
        setIsReady(true)
      } else if (typeof window !== 'undefined' && !window.location.hash.includes('access_token')) {
        // If no session and no token in URL, it's definitely invalid
        setStatus({
          type: 'error',
          message: 'Sesi tidak valid atau telah kedaluwarsa. Silakan minta tautan pemulihan baru.'
        })
        setIsReady(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' })
      return
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Kata sandi minimal 6 karakter.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setStatus({
        type: 'success',
        message: 'Kata sandi berhasil diperbarui! Anda akan dialihkan ke Dasbor...'
      })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat memperbarui kata sandi.'
      })
      setLoading(false)
    }
  }

  if (!isReady) {
    return (
      <div className="bg-background-subtle min-h-screen w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-background-subtle min-h-screen w-full flex items-center justify-center font-body-md text-text-main p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-light p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined text-[24px]">lock_reset</span>
          </div>
          <h1 className="font-headline-sm text-[24px] font-semibold text-text-main">Buat Kata Sandi Baru</h1>
          <p className="text-body-sm text-text-muted mt-2 text-center">
            Silakan masukkan kata sandi baru Anda untuk akun ini.
          </p>
        </div>

        {status && (
          <div className={`w-full mb-6 p-4 text-sm rounded-lg flex items-start gap-2 ${
            status.type === 'success' ? 'bg-success/10 text-success' : 'bg-error-container text-on-error-container'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {status.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{status.message}</span>
          </div>
        )}

        {status?.type !== 'success' && status?.message !== 'Sesi tidak valid atau telah kedaluwarsa. Silakan minta tautan pemulihan baru.' ? (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block font-label-md text-[14px] font-semibold text-text-main">Kata Sandi Baru</label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block font-label-md text-[14px] font-semibold text-text-main">Konfirmasi Kata Sandi Baru</label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-label-md text-[14px] font-semibold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
            </button>
          </form>
        ) : null}

        {status?.message === 'Sesi tidak valid atau telah kedaluwarsa. Silakan minta tautan pemulihan baru.' && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/forgot-password')}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-sm"
            >
              Kembali ke Lupa Kata Sandi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
