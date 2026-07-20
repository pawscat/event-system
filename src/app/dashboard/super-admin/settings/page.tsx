'use client'

import { useState } from 'react'

export default function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security'>('general')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('Pengaturan berhasil disimpan!')
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Pengaturan Global</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Konfigurasi utama tingkat sistem dan platform Event Ku</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-on-primary font-label-md text-[14px] font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">{isSaving ? 'sync' : 'save'}</span>
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-surface-container-lowest border-r border-border-light p-4 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`text-left px-4 py-3 rounded-xl font-label-md text-[14px] font-semibold transition-colors flex items-center gap-3 ${
              activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-container hover:text-text-main'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">branding_watermark</span>
            Identitas Aplikasi
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`text-left px-4 py-3 rounded-xl font-label-md text-[14px] font-semibold transition-colors flex items-center gap-3 ${
              activeTab === 'email' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-container hover:text-text-main'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">mail</span>
            SMTP & Email
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`text-left px-4 py-3 rounded-xl font-label-md text-[14px] font-semibold transition-colors flex items-center gap-3 ${
              activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-container hover:text-text-main'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">shield</span>
            Keamanan & Sesi
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h2 className="font-headline-sm font-semibold text-text-main mb-6 border-b border-border-light pb-4">Identitas Aplikasi</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">Nama Platform (Branding)</label>
                  <input type="text" defaultValue="Event Ku" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                  <p className="text-[12px] text-text-muted mt-1.5">Nama ini akan muncul pada judul halaman dan bagian header seluruh admin.</p>
                </div>
                
                <div>
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">Deskripsi Singkat</label>
                  <textarea rows={3} defaultValue="Sistem Manajemen Event Terpadu" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                </div>
                
                <div>
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">Logo Aplikasi</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-on-primary font-bold text-2xl shadow-sm">
                      E
                    </div>
                    <button className="px-4 py-2 bg-surface-container border border-border-light rounded-lg font-label-md text-[13px] hover:bg-surface-container-high transition-colors text-text-main">
                      Ubah Logo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-border-light pb-4 mb-6">
                <h2 className="font-headline-sm font-semibold text-text-main">Konfigurasi SMTP Server</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  <span className="text-label-sm text-success font-medium">Terkoneksi</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">SMTP Host</label>
                  <input type="text" defaultValue="smtp.sendgrid.net" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">SMTP Port</label>
                  <input type="number" defaultValue="587" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">Enkripsi (TLS/SSL)</label>
                  <select className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]">
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">Email Pengirim (Sender Address)</label>
                  <input type="email" defaultValue="noreply@event-ku.com" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">SMTP Username</label>
                  <input type="text" defaultValue="apikey" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-sm font-semibold text-text-main mb-1.5">SMTP Password</label>
                  <input type="password" defaultValue="************************" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-light">
                <button className="text-secondary font-label-md font-semibold text-[13px] hover:underline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                  Kirim Email Tes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h2 className="font-headline-sm font-semibold text-text-main mb-6 border-b border-border-light pb-4">Keamanan & Sesi Global</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-label-md font-semibold text-text-main">Masa Aktif Sesi (Session Timeout)</h3>
                  <p className="text-[13px] text-text-muted mb-3">Waktu yang dibutuhkan sebelum pengguna (semua admin) otomatis log out karena tidak aktif.</p>
                  <select className="w-full md:w-64 px-4 py-2.5 bg-surface-container-lowest border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-[14px]">
                    <option value="3600">1 Jam</option>
                    <option value="14400">4 Jam</option>
                    <option value="28800">8 Jam</option>
                    <option value="86400">24 Jam</option>
                    <option value="604800">7 Hari</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-label-md font-semibold text-text-main">Mode Perawatan (Maintenance Mode)</h3>
                  <p className="text-[13px] text-text-muted mb-3">Jika diaktifkan, seluruh pengguna dan halaman pendaftaran publik akan dialihkan ke halaman peringatan perbaikan sistem (kecuali Super Admin).</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-focus:ring-2 peer-focus:ring-error/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-border-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
                    <span className="ml-3 text-sm font-semibold text-error">Aktifkan Maintenance Mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
