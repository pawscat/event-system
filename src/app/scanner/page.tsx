'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ScannerPage() {
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCode, setManualCode] = useState('')

  return (
    <div className="bg-black text-white font-body-md text-body-md h-screen w-full overflow-hidden flex flex-col relative select-none">
      {/* Simulated Camera Feed Background */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60" 
          alt="Scanner Background"
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
        />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 flex justify-between items-center px-4 pt-6 pb-4 w-full">
        <Link href="/dashboard" aria-label="Tutup Pemindai" className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </Link>
        <button className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-black/60 transition-colors">
          <span className="font-label-md text-[14px] font-semibold truncate max-w-[150px]">Global Tech Summit &apos;24</span>
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </button>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </header>

      {/* Scanner Area Overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none w-full">
        {/* Target Frame with Cutout - Used simple borders instead of complex box-shadow for React simplicity */}
        <div className="relative w-[260px] h-[260px] rounded-xl border border-white/20">
          {/* Animated Scan Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse z-10 top-1/2"></div>
          
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
        </div>
        
        <p className="text-white font-label-md text-[14px] mt-8 text-center px-8 text-shadow-sm">
          Arahkan QR Code peserta ke dalam bingkai
        </p>

        {/* Camera Controls */}
        <div className="flex gap-6 mt-8 pointer-events-auto">
          <button className="flex flex-col items-center gap-2 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 active:scale-95 transition-transform">
              <span className="material-symbols-outlined">flashlight_on</span>
            </div>
            <span className="font-label-sm text-[12px] text-white/80">Senter</span>
          </button>
          <button className="flex flex-col items-center gap-2 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 active:scale-95 transition-transform">
              <span className="material-symbols-outlined">flip_camera_ios</span>
            </div>
            <span className="font-label-sm text-[12px] text-white/80">Kamera</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet: Controls & Recent Scans */}
      <div className="relative z-30 bg-surface text-text-main w-full rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.15)] flex flex-col flex-shrink-0 mt-auto pb-8">
        {/* Drag Handle Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-outline-variant/50"></div>
        </div>
        
        <div className="px-6 pt-4 pb-6 flex flex-col gap-6">
          {/* Manual Entry Action */}
          {!showManualInput ? (
            <button 
              onClick={() => setShowManualInput(true)}
              className="w-full bg-secondary text-on-secondary font-label-md text-[14px] font-semibold py-3.5 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>keyboard</span>
              Input Kode Manual
            </button>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Masukkan Kode (cth: AB12CD)"
                className="flex-1 bg-surface-container-lowest border border-border-light rounded-lg px-4 py-3 text-text-main font-body-md uppercase focus:ring-2 focus:ring-primary outline-none"
              />
              <button 
                className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold shadow-sm active:scale-[0.98] transition-all"
                onClick={() => {
                  // Simulate check-in
                  alert(`Memeriksa kode ${manualCode}...`)
                  setManualCode('')
                  setShowManualInput(false)
                }}
              >
                Check
              </button>
            </div>
          )}

          {/* Recent Scans Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h2 className="font-headline-sm text-[20px] font-bold text-text-main">Riwayat Scan</h2>
              <button className="font-label-sm text-[12px] font-medium text-secondary">Lihat Semua</button>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Scan Item 1 */}
              <div className="flex items-center gap-4 p-3 rounded-xl border border-border-light bg-surface-container-lowest">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary font-bold">
                  BS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-[14px] font-semibold text-text-main truncate">Budi Santoso</p>
                  <p className="font-body-sm text-[14px] text-text-muted truncate">VIP Pass • TIK-8921</p>
                </div>
                <div className="bg-[#D1FAE5] text-[#065F46] px-2.5 py-1 rounded-md flex items-center gap-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span className="font-label-sm text-[12px] font-medium">Hadir</span>
                </div>
              </div>

              {/* Scan Item 2 */}
              <div className="flex items-center gap-4 p-3 rounded-xl border border-border-light bg-surface-container-lowest">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary font-bold">
                  AW
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-[14px] font-semibold text-text-main truncate">Ayu Wulandari</p>
                  <p className="font-body-sm text-[14px] text-text-muted truncate">Regular • TIK-3342</p>
                </div>
                <div className="bg-[#D1FAE5] text-[#065F46] px-2.5 py-1 rounded-md flex items-center gap-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span className="font-label-sm text-[12px] font-medium">Hadir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
