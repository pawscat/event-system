'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'

type ScanResult = {
  success: boolean
  message: string
  participant?: {
    name: string
    organization: string
    guest_id: string
  }
  error?: string
}

export default function ScannerClient({ eventId, manualCheckinAllowed }: { eventId: string, manualCheckinAllowed: boolean }) {
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Recent scans state
  const [recentScans, setRecentScans] = useState<(ScanResult & { time: Date })[]>([])
  
  // To prevent double scanning
  const lastScannedCode = useRef<string | null>(null)
  const lastScannedTime = useRef<number>(0)

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    )

    scanner.render(onScanSuccess, onScanError)

    function onScanSuccess(decodedText: string) {
      const now = Date.now()
      // Debounce scans (ignore if same code scanned within 3 seconds)
      if (lastScannedCode.current === decodedText && (now - lastScannedTime.current) < 3000) {
        return
      }
      
      lastScannedCode.current = decodedText
      lastScannedTime.current = now
      
      handleCheckin(decodedText, 'qr')
    }

    function onScanError(errorMessage: string) {
      // Ignore background scan errors
    }

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error)
      })
    }
  }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckin = async (code: string, method: 'qr' | 'manual') => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const res = await fetch(`/api/v1/events/${eventId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, method })
      })

      const data = await res.json()
      
      const scanRecord = {
        success: res.ok,
        message: data.message || data.error,
        participant: data.participant,
        error: res.ok ? undefined : (data.error || 'Terjadi kesalahan'),
        time: new Date()
      }

      setRecentScans(prev => [scanRecord, ...prev].slice(0, 10)) // Keep last 10 scans

      if (res.ok) {
        // Success sound or feedback could be added here
      } else {
        // Error sound or feedback
      }

    } catch (err) {
      console.error(err)
      setRecentScans(prev => [{
        success: false,
        message: 'Gagal menghubungi server',
        error: 'Network Error',
        time: new Date()
      }, ...prev].slice(0, 10))
    } finally {
      setIsProcessing(false)
      if (method === 'manual') {
        setManualCode('')
      }
    }
  }

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return
    handleCheckin(manualCode.trim(), 'manual')
  }

  return (
    <div className="bg-black text-white font-body-md text-body-md h-screen w-full overflow-hidden flex flex-col relative select-none">
      
      {/* Top Navigation */}
      <header className="relative z-20 flex justify-between items-center px-4 pt-6 pb-4 w-full bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/dashboard/admin-scanner" aria-label="Tutup Pemindai" className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </Link>
        <div className="flex flex-col items-center">
          <span className="font-label-md text-[14px] font-semibold text-white">Scanner</span>
        </div>
        <div className="w-10"></div>
      </header>

      {/* QR Scanner Feed */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full bg-black">
        <style dangerouslySetInnerHTML={{__html: `
          #qr-reader {
            width: 100%;
            height: 100%;
            border: none !important;
          }
          #qr-reader__scan_region {
            background-color: black;
          }
          #qr-reader__dashboard {
            display: none !important; /* Hide default html5-qrcode controls */
          }
          #qr-reader video {
            object-fit: cover;
            width: 100% !important;
            height: 100% !important;
          }
        `}} />
        <div id="qr-reader" className="w-full h-full absolute inset-0"></div>
        
        {/* Overlay cut-out (visual only) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[260px] h-[260px] rounded-xl border border-white/20 relative">
            <div className="absolute left-0 right-0 h-0.5 bg-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse z-10 top-1/2"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet: Controls & Recent Scans */}
      <div className="relative z-30 bg-surface text-text-main w-full rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.15)] flex flex-col flex-shrink-0 mt-auto pb-8 h-[45vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-outline-variant/50"></div>
        </div>
        
        <div className="px-6 pt-4 pb-6 flex flex-col gap-4 h-full overflow-hidden">
          {/* Manual Entry Action */}
          {manualCheckinAllowed && (
            !showManualInput ? (
              <button 
                onClick={() => setShowManualInput(true)}
                className="w-full bg-secondary text-on-secondary font-label-md text-[14px] font-semibold py-3.5 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-[0.98] transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>keyboard</span>
                Input Kode Manual
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <input 
                  type="text" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan Kode (cth: GUEST-1001)"
                  className="flex-1 bg-surface-container-lowest border border-border-light rounded-lg px-4 py-3 text-text-main font-body-md uppercase focus:ring-2 focus:ring-primary outline-none"
                  disabled={isProcessing}
                />
                <button 
                  className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                  onClick={handleManualSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Memproses...' : 'Check'}
                </button>
                <button 
                  onClick={() => setShowManualInput(false)}
                  className="p-3 text-text-muted hover:bg-surface-container-low rounded-lg"
                >
                  Batal
                </button>
              </div>
            )
          )}

          {/* Recent Scans Section */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 pb-4">
            <h2 className="font-headline-sm text-[16px] font-bold text-text-main sticky top-0 bg-surface py-2 z-10">Riwayat Scan Terakhir</h2>
            
            <div className="flex flex-col gap-3">
              {recentScans.length === 0 ? (
                <div className="text-center text-text-muted py-8 text-sm">Belum ada scan yang dilakukan.</div>
              ) : (
                recentScans.map((scan, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border ${scan.success ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'}`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white ${scan.success ? 'bg-success' : 'bg-error'}`}>
                      <span className="material-symbols-outlined">{scan.success ? 'check' : 'close'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {scan.success && scan.participant ? (
                        <>
                          <p className="font-label-md text-[14px] font-semibold text-text-main truncate">{scan.participant.name}</p>
                          <p className="font-body-sm text-[12px] text-text-muted truncate">{scan.participant.guest_id} - {scan.participant.organization || 'Umum'}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-label-md text-[14px] font-semibold text-error truncate">Scan Gagal</p>
                          <p className="font-body-sm text-[12px] text-error/80 truncate">{scan.message || scan.error}</p>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-text-muted flex-shrink-0">
                      {scan.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
