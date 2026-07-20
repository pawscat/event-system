import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function RecentCheckinsPage(props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const { eventId } = params;
  return (
    <div className="bg-surface p-6 rounded-xl border border-border-light shadow-sm">
      <h3 className="font-title-md font-semibold mb-4 text-text-main">Halaman Check-ins Terbaru</h3>
      <p className="text-body-sm text-text-muted">Sedang dalam tahap pengembangan.</p>
    </div>
  )
}
