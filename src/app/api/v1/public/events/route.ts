import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// External integration API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'published'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase
    .from('events')
    .select(`
      id,
      name,
      slug,
      short_description,
      start_time,
      end_time,
      location_type,
      location_name,
      status,
      banner_image_url
    `)
    .eq('status', status)
    .order('start_time', { ascending: true })

  const { data: events, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: events
  })
}
