import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function EmailTemplatesPage(props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const { eventId } = params;
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )

  const { data: templates } = await supabase
    .from('email_templates')
    .select(`
      *,
      users ( full_name )
    `)
    .or(`event_id.eq.${eventId},event_id.is.null`)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg text-[28px] font-semibold text-text-main">Template Email</h1>
          <p className="text-body-sm text-[14px] text-text-muted mt-1">Kelola template untuk pengiriman tiket dan pengumuman</p>
        </div>
        <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-[14px] font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          Buat Template Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <div key={template.id} className="bg-surface p-5 rounded-xl border border-border-light shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                template.event_id ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-high text-text-muted'
              }`}>
                {template.event_id ? 'Spesifik Acara' : 'Global (Default)'}
              </span>
              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                template.is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {template.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            
            <h3 className="font-title-md font-semibold text-text-main mb-1 truncate">{template.name}</h3>
            <p className="text-body-sm text-text-muted mb-4 flex-1">
              Subjek: {template.subject}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-light">
              <span className="text-[12px] text-text-muted flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">update</span>
                {new Date(template.updated_at).toLocaleDateString('id-ID')}
              </span>
              <button className="text-primary hover:text-primary/80 font-label-sm text-[13px] font-semibold">
                Edit
              </button>
            </div>
          </div>
        ))}
        
        {(!templates || templates.length === 0) && (
          <div className="col-span-full py-12 text-center text-text-muted bg-surface-container-lowest rounded-xl border border-border-light">
            Belum ada template email yang tersedia.
          </div>
        )}
      </div>
    </div>
  )
}
