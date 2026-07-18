'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type EventData = {
  name: string
  slug: string
  description: string
  venue: string
  capacity: number | ''
  start_at: string
  end_at: string
  registration_open_at: string
  registration_close_at: string
  status: 'draft' | 'published' | 'archived'
}

export function EventForm({ initialData, eventId }: { initialData?: Partial<EventData>, eventId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSlugEdited, setIsSlugEdited] = useState(!!initialData?.slug)
  
  const [formData, setFormData] = useState<EventData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    venue: initialData?.venue || '',
    capacity: initialData?.capacity || '',
    start_at: initialData?.start_at ? new Date(initialData.start_at).toISOString().slice(0, 16) : '',
    end_at: initialData?.end_at ? new Date(initialData.end_at).toISOString().slice(0, 16) : '',
    registration_open_at: initialData?.registration_open_at ? new Date(initialData.registration_open_at).toISOString().slice(0, 16) : '',
    registration_close_at: initialData?.registration_close_at ? new Date(initialData.registration_close_at).toISOString().slice(0, 16) : '',
    status: initialData?.status || 'draft'
  })

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: isSlugEdited ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Prepare data for Supabase
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        venue: formData.venue,
        capacity: formData.capacity === '' ? null : Number(formData.capacity),
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        registration_open_at: formData.registration_open_at ? new Date(formData.registration_open_at).toISOString() : null,
        registration_close_at: formData.registration_close_at ? new Date(formData.registration_close_at).toISOString() : null,
        status: formData.status
      }

      if (eventId) {
        // Update
        const { error: updateError } = await supabase
          .from('events')
          .update(payload)
          .eq('id', eventId)

        if (updateError) throw updateError
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('events')
          .insert([payload])
          .select()
          .single()

        if (insertError) throw insertError
      }

      router.push('/dashboard/super-admin/events')
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err) || 'Terjadi kesalahan saat menyimpan data.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-border-light rounded-xl shadow-sm p-6 max-w-3xl">
      {error && (
        <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-sm rounded-lg flex items-start gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Nama Acara <span className="text-danger">*</span></label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Cth: Seminar Nasional 2026"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">URL Slug <span className="text-danger">*</span></label>
            <div className="flex items-center">
              <span className="px-4 py-2 bg-surface-container-low border border-r-0 border-border-light rounded-l-lg text-text-muted font-body-sm">
                eventku.id/public/events/
              </span>
              <input 
                required
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setIsSlugEdited(true)
                  setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})
                }}
                className="flex-1 px-4 py-2 bg-surface border border-border-light rounded-r-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
                placeholder="seminar-nasional-2026"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Deskripsi</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Jelaskan detail mengenai acara ini..."
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Waktu Mulai <span className="text-danger">*</span></label>
            <input 
              required
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) => setFormData({...formData, start_at: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Waktu Selesai <span className="text-danger">*</span></label>
            <input 
              required
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) => setFormData({...formData, end_at: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Lokasi <span className="text-danger">*</span></label>
            <input 
              required
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Cth: Jakarta Convention Center"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Kapasitas (Kosongkan jika tidak terbatas)</label>
            <input 
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value ? Number(e.target.value) : ''})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
              placeholder="Cth: 500"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Pembukaan Registrasi</label>
            <input 
              type="datetime-local"
              value={formData.registration_open_at}
              onChange={(e) => setFormData({...formData, registration_open_at: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Penutupan Registrasi</label>
            <input 
              type="datetime-local"
              value={formData.registration_close_at}
              onChange={(e) => setFormData({...formData, registration_close_at: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border-light rounded-lg text-text-main font-body-md focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <div className="space-y-2 md:col-span-2 pt-4 border-t border-border-light">
            <label className="block font-label-md text-[14px] font-semibold text-text-main">Status Acara</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as EventData['status']})}
                  className="text-primary focus:ring-primary"
                />
                <span className="font-body-md text-text-main">Draft (Tersembunyi)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as EventData['status']})}
                  className="text-success focus:ring-success"
                />
                <span className="font-body-md text-text-main">Published (Aktif & Publik)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  value="archived"
                  checked={formData.status === 'archived'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as EventData['status']})}
                  className="text-text-muted focus:ring-text-muted"
                />
                <span className="font-body-md text-text-main">Selesai / Archived</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Link href="/dashboard/super-admin/events" className="px-6 py-2.5 rounded-lg border border-border-light bg-surface text-text-main font-label-md hover:bg-surface-container-low transition-colors">
            Batal
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            Simpan Acara
          </button>
        </div>
      </div>
    </form>
  )
}
