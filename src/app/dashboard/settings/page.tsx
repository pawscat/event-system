import { PasswordForm } from './password-form'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Pengaturan</h1>
        <p className="text-body-sm text-[14px] text-text-muted mt-1">Konfigurasi dasar aplikasi dan integrasi eksternal</p>
      </div>

      <div className="grid gap-6">
        {/* Integrasi API */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm">
          <h2 className="text-title-md font-semibold text-text-main mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">api</span>
            Integrasi API Publik
          </h2>
          <p className="text-body-md text-text-muted mb-4">
            Gunakan *endpoint* API publik berikut untuk menampilkan daftar acara di *website* *company profile* atau aplikasi pihak ketiga Anda.
          </p>
          
          <div className="bg-surface-container-low rounded-lg p-4 font-mono text-sm border border-border-light text-text-main">
            <div className="flex justify-between items-center">
              <span>GET /api/v1/public/events</span>
              <button className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors" title="Copy to clipboard">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
            <div className="mt-2 text-text-muted text-[12px]">
              Query Params:<br/>
              ?status=published (default)<br/>
              ?status=draft
            </div>
          </div>
        </div>

        {/* Profil Akun */}
        <PasswordForm />
      </div>
    </div>
  )
}
