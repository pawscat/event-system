'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type ParticipantData = {
  event_id: string
  name: string
  email: string
  phone: string
  company: string
  job_title: string
}

export function ParticipantForm({ initialData, participantId, eventId }: { initialData?: Partial<ParticipantData>, participantId?: string, eventId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<{id: string, name: string}[]>([])
  
  const [formData, setFormData] = useState<ParticipantData>({
    event_id: initialData?.event_id || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    job_title: initialData?.job_title || ''
  })

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase.from('events').select('id, name').order('created_at', { ascending: false })
      if (data) setEvents(data)
    }
    fetchEvents()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const payload = {
        event_id: formData.event_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        job_title: formData.job_title || null,
      }

      if (participantId) {
        const { error: updateError } = await supabase
          .from('participants')
          .update(payload)
          .eq('id', participantId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('participants')
          .insert([payload])

        if (insertError) throw insertError
      }

      router.push('/dashboard/admin-event/participants')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data peserta.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-border-light rounded-xl shadow-sm p-6 max-w-2xl">
      {error && (
        <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-[14px] rounded-lg flex items-start gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block font-label-md text-[14px] font-semibold text-text-main">Pilih Acara <span className="text-danger">*</span></label>
          <select 
            required
            value={formData.event_id}
            onChange={(e) => setFormData({...formData, event_id: e.target.value})}
            className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="" disabled>Pilih acara...</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Nama Lengkap <span className="text-danger">*</span></label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Cth: Budi Santoso"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Email <span className="text-danger">*</span></label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="budi@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Nomor Telepon / WhatsApp</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="0812xxxxxx"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Perusahaan / Organisasi</label>
            <input 
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="PT Contoh Maju"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Jabatan / Posisi</label>
            <input 
              type="text"
              value={formData.job_title}
              onChange={(e) => setFormData({...formData, job_title: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Software Engineer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Link href={`/dashboard/admin-event/events/${eventId}/participants`} className="px-6 py-2.5 rounded-lg border border-border-light bg-surface text-text-main font-label-md text-[14px] font-semibold hover:bg-surface-container-low transition-colors">
            Batal
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-[14px] font-semibold hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            Simpan Peserta
          </button>
        </div>
      </div>
    </form>
  )
}
