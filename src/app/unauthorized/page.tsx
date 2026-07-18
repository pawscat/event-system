import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-border-light shadow-lg text-center">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">gpp_bad</span>
        <h1 className="font-headline-md text-2xl font-bold text-text-main mb-2">Akses Ditolak</h1>
        <p className="text-body-md text-text-muted mb-8">
          Anda tidak memiliki izin (role) yang diperlukan untuk mengakses halaman ini. Jika Anda merasa ini adalah sebuah kesalahan, silakan hubungi Super Admin.
        </p>
        <Link 
          href="/dashboard"
          className="inline-flex justify-center items-center px-6 py-3 bg-primary text-on-primary rounded-xl font-label-lg font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Kembali ke Dashboard Utama
        </Link>
      </div>
    </div>
  )
}
