'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal masuk. Periksa kembali email dan kata sandi Anda.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background-subtle h-screen w-full font-body-md text-text-main overflow-hidden flex">
      {/* Left Column: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-24 bg-surface-container-lowest shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative h-full">
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Brand Anchor */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
            </div>
            <h1 className="font-headline-lg text-[28px] font-semibold text-primary tracking-tight">EventFlow</h1>
            <p className="font-body-sm text-[14px] text-text-muted mt-2 text-center">Sistem Manajemen Logistik Enterprise</p>
          </div>
          
          {error && (
            <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-sm rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Container */}
          <form className="w-full space-y-5" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="email">Email Admin</label>
              <div className="relative input-focus-ring rounded-lg transition-shadow">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">mail</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-2.5 bg-surface border border-border-light rounded-lg font-body-md text-text-main placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
                  id="email"
                  name="email"
                  placeholder="admin@perusahaan.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-[14px] font-semibold text-text-main" htmlFor="password">Kata Sandi</label>
              <div className="relative input-focus-ring rounded-lg transition-shadow">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-muted text-[20px]">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-11 py-2.5 bg-surface border border-border-light rounded-lg font-body-md text-text-main placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-primary transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Secondary Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0 bg-surface cursor-pointer"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                <label className="ml-2 block font-body-sm text-[14px] text-text-muted cursor-pointer select-none" htmlFor="remember-me">
                  Ingat saya
                </label>
              </div>
              <div className="text-sm">
                <Link className="font-label-sm text-[12px] font-medium text-primary hover:text-secondary-container transition-colors" href="/forgot-password">
                  Lupa kata sandi?
                </Link>
              </div>
            </div>
            
            {/* Submit Action */}
            <div className="pt-4">
              <button
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-[14px] font-semibold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                Masuk Dashboard
              </button>
            </div>
          </form>
          
          {/* Footer text */}
          <p className="mt-10 font-body-sm text-[14px] text-text-muted text-center">
            Portal ini khusus untuk administrator internal.<br />Hubungi IT Support jika mengalami kendala.
          </p>
        </div>
      </div>
      
      {/* Right Column: Visual Section */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface-container">
        {/* Abstract Illustration */}
        <div className="absolute inset-0 w-full h-full">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-90 mix-blend-multiply"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')" }}
          ></div>
        </div>
        {/* Decorative Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low/40 to-primary-fixed/20"></div>
      </div>
    </div>
  )
}
