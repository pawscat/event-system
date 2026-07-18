'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      
      {/* Header Publik */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              <span className="text-headline-sm font-bold text-text-main">Event Ku</span>
            </div>
            
            <nav className="hidden md:flex gap-8">
              <Link href="#" className="text-label-md font-semibold text-text-muted hover:text-primary transition-colors">Beranda</Link>
              <Link href="#fitur" className="text-label-md font-semibold text-text-muted hover:text-primary transition-colors">Fitur</Link>
              <Link href="#cara-kerja" className="text-label-md font-semibold text-text-muted hover:text-primary transition-colors">Cara Kerja</Link>
            </nav>

            <div className="flex items-center">
              <Link 
                href="/login" 
                className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md font-semibold shadow-sm hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Masuk Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-32 lg:pb-40">
          <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-top-left -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-display-sm sm:text-display-md lg:text-display-lg font-bold text-text-main max-w-4xl mx-auto tracking-tight">
              Platform Manajemen Event Logistik Enterprise dengan QR Code
            </h1>
            <p className="mt-6 text-body-lg text-text-muted max-w-2xl mx-auto">
              Event Ku membantu Anda mengelola pendaftaran peserta, menerbitkan E-Ticket QR Code, melakukan check-in instan, dan memantau kehadiran dalam satu sistem terpusat yang aman dan responsif.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="inline-flex justify-center items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-full font-label-lg font-semibold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Masuk Admin
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <Link 
                href="#cara-kerja" 
                className="inline-flex justify-center items-center gap-2 bg-surface text-text-main border border-border-light px-8 py-3.5 rounded-full font-label-lg font-semibold hover:bg-surface-container-low transition-all"
              >
                Lihat Cara Kerja
              </Link>
            </div>
          </div>
        </section>

        {/* Fitur Section */}
        <section id="fitur" className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-headline-lg font-bold text-text-main">Fitur Unggulan</h2>
              <p className="mt-4 text-body-lg text-text-muted max-w-2xl mx-auto">Segala alat yang Anda butuhkan untuk memastikan acara berjalan lancar dari awal hingga akhir.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Registrasi Peserta', icon: 'how_to_reg', desc: 'Formulir online dan import Excel massal untuk mendata seluruh calon peserta.' },
                { title: 'E-Ticket & QR Code', icon: 'qr_code', desc: 'Sistem otomatis mengirimkan tiket dan QR code unik kepada setiap peserta terdaftar.' },
                { title: 'Check-in Cepat', icon: 'qr_code_scanner', desc: 'Gunakan kamera smartphone atau scanner untuk validasi tiket masuk dengan sekejap.' },
                { title: 'Broadcast Email', icon: 'mail', desc: 'Kirim pengingat atau pengumuman massal langsung ke kotak masuk peserta.' },
                { title: 'Laporan Kehadiran', icon: 'monitoring', desc: 'Pantau grafik registrasi dan persentase kehadiran aktual secara real-time.' },
                { title: 'Role Based Access', icon: 'admin_panel_settings', desc: 'Pembagian akses aman untuk Event Admin, Registrasi, dan Scanner di lapangan.' },
              ].map((fitur, i) => (
                <div key={i} className="bg-surface p-8 rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">{fitur.icon}</span>
                  </div>
                  <h3 className="text-title-lg font-semibold text-text-main mb-3">{fitur.title}</h3>
                  <p className="text-body-md text-text-muted">{fitur.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cara Kerja Section */}
        <section id="cara-kerja" className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-headline-lg font-bold text-text-main">Cara Kerja Event Ku</h2>
              <p className="mt-4 text-body-lg text-text-muted max-w-2xl mx-auto">Empat langkah mudah menuju manajemen acara tanpa stres.</p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border-light -translate-x-1/2"></div>
              
              <div className="space-y-12 lg:space-y-0 relative">
                {[
                  { step: '01', title: 'Buat Event Baru', desc: 'Admin membuat acara di dashboard dan mengatur jadwal, lokasi, serta detail kapasitas.' },
                  { step: '02', title: 'Bagikan Link Registrasi', desc: 'Peserta mendaftar mandiri melalui landing page khusus acara atau di-import via Excel.' },
                  { step: '03', title: 'Peserta Menerima E-Ticket', desc: 'Sistem langsung memproses dan mengirim tiket ber-QR ke email peserta terdaftar.' },
                  { step: '04', title: 'Scan QR Saat Acara', desc: 'Petugas lapangan memindai kode QR untuk mencatat kedatangan dan mencegah tiket ganda.' },
                ].map((item, i) => (
                  <div key={i} className={`flex flex-col lg:flex-row items-center justify-between ${i % 2 === 0 ? 'lg:flex-row-reverse' : ''} lg:mb-24 relative`}>
                    <div className="w-full lg:w-5/12 mb-8 lg:mb-0">
                      <div className={`bg-surface-container-lowest p-8 rounded-2xl border border-border-light shadow-sm ${i % 2 === 0 ? 'lg:text-left' : 'lg:text-right'}`}>
                        <span className="text-primary font-bold text-title-md mb-2 block">Langkah {item.step}</span>
                        <h3 className="text-headline-sm font-bold text-text-main mb-4">{item.title}</h3>
                        <p className="text-body-md text-text-muted">{item.desc}</p>
                      </div>
                    </div>
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 bg-primary rounded-full items-center justify-center border-4 border-surface shadow-md z-10 text-on-primary font-bold text-title-lg">
                      {item.step}
                    </div>
                    <div className="w-full lg:w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high border-t border-border-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
            <span className="text-title-md font-bold text-text-main">Event Ku</span>
          </div>
          <p className="text-body-sm text-text-muted text-center md:text-left">
            &copy; {new Date().getFullYear()} Event Ku. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-body-sm text-text-muted hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
