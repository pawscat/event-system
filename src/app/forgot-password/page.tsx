'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Step = 'email' | 'otp' | 'password'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  
  // Form state
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) throw error

      setStatus({
        type: 'success',
        message: 'Kode OTP telah dikirim ke email Anda. Silakan periksa kotak masuk (atau folder spam) Anda.'
      })
      setStep('otp')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Gagal mengirim kode OTP. Pastikan email terdaftar.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      })

      if (error) throw error

      setStatus(null) // clear status for the next step
      setStep('password') // move to password reset
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Kode OTP tidak valid atau telah kedaluwarsa.'
      })
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="bg-background-subtle min-h-screen w-full flex items-center justify-center font-body-md text-text-main p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-light p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined text-[24px]">
              {step === 'email' ? 'vpn_key' : step === 'otp' ? 'dialpad' : 'lock_reset'}
            </span>
          </div>
          <h1 className="font-headline-sm text-[24px] font-semibold text-text-main">
            {step === 'email' ? 'Lupa Kata Sandi?' : step === 'otp' ? 'Verifikasi OTP' : 'Buat Kata Sandi Baru'}
          </h1>
          <p className="text-body-sm text-text-muted mt-2 text-center">
            {step === 'email' 
              ? 'Masukkan alamat email admin Anda untuk mendapatkan kode OTP pemulihan.' 
              : step === 'otp' 
              ? `Masukkan kode OTP yang telah dikirim ke ${email}.`
              : 'Silakan masukkan kata sandi baru Anda untuk akun ini.'}
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

        {/* STEP 1: EMAIL */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
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
              {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="otp">Kode OTP</label>
              <div className="relative input-focus-ring rounded-lg transition-shadow">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">password</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-2.5 bg-surface border border-border-light rounded-lg font-body-md text-text-main placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none font-mono tracking-widest text-center text-lg"
                  id="otp"
                  type="text"
                  placeholder="••••••"
                  required
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-label-md text-[14px] font-semibold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
              type="submit"
              disabled={loading || otp.length < 6}
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
            
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => handleRequestOtp()}
                disabled={loading}
                className="text-[14px] font-semibold text-primary hover:text-primary-container transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {loading ? 'Mengirim ulang...' : 'Kirim ulang email'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 'password' && (
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
        )}

        {step !== 'password' && (
          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 font-label-sm text-[14px] font-semibold text-text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali ke Halaman Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
