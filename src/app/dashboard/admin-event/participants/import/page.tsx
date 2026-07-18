'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ImportParticipantsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    // Optional: Could add an event selection dropdown here to attach all imported participants to a specific event
    // formData.append('eventId', selectedEventId)

    try {
      const res = await fetch('/api/v1/admin/participants/import', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to import')
      
      setResult({ success: true, ...data })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setResult({ success: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Import Peserta</h1>
        <p className="text-body-sm text-[14px] text-text-muted mt-1">Unggah file Excel (.xlsx atau .csv) untuk menginput banyak peserta sekaligus.</p>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-light shadow-sm">
        <h2 className="text-title-md font-semibold text-text-main mb-4">Upload File Excel</h2>
        
        <div className="border-2 border-dashed border-border-light rounded-xl p-8 text-center hover:bg-surface-container-low transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept=".xlsx,.csv" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <span className="material-symbols-outlined text-4xl text-text-muted">cloud_upload</span>
            <div className="text-body-md font-medium text-text-main">
              {file ? file.name : 'Pilih File Excel atau seret ke sini'}
            </div>
            <div className="text-body-sm text-text-muted">
              Format yang didukung: XLSX, CSV (maksimal 5MB)
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <a href="#" className="text-primary text-label-sm font-medium hover:underline">
            Unduh Template Excel
          </a>
          <div className="flex gap-2">
            <Link href="/dashboard/admin-event/participants" className="px-4 py-2 border border-border-light rounded-lg text-text-main font-semibold hover:bg-surface-container-low transition-colors">
              Batal
            </Link>
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Memproses...</>
              ) : 'Mulai Import'}
            </button>
          </div>
        </div>
        
        {result && (
          <div className={`mt-6 p-4 rounded-xl border ${result.success ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'}`}>
            <h3 className="font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">{result.success ? 'check_circle' : 'error'}</span>
              {result.success ? 'Import Berhasil' : 'Import Gagal'}
            </h3>
            <p className="text-sm mt-1">
              {result.success ? `Berhasil mengimpor ${result.inserted} peserta.` : result.error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
