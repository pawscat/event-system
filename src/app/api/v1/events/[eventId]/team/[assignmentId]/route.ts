import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserAuthData } from '@/lib/actions/auth-actions'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string; assignmentId: string }> }
) {
  try {
    const { eventId, assignmentId } = await params
    const authData = await getUserAuthData()

    if (!authData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isSuperAdmin = authData.role === 'super_admin'
    const isEventAdmin = authData.assignments.some(a => a.event_id === eventId && a.role === 'event_admin')

    if (!isSuperAdmin && !isEventAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check existing assignment
    const { data: assignment, error: fetchErr } = await supabaseAdmin
      .from('event_staff_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('event_id', eventId)
      .single()

    if (fetchErr || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (!isSuperAdmin && assignment.role === 'event_admin') {
      return NextResponse.json({ error: 'Event Admins cannot deactivate other Event Admins' }, { status: 403 })
    }

    // Set status to inactive
    const { error: updateErr } = await supabaseAdmin
      .from('event_staff_assignments')
      .update({ status: 'inactive' })
      .eq('id', assignmentId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to deactivate assignment' }, { status: 500 })
    }

    // Audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: authData.id,
        event_id: eventId,
        action: 'deactivate_staff',
        details: { assignment_id: assignmentId, target_user: assignment.user_id }
      })

    return NextResponse.json({ success: true, message: 'Assignment deactivated' })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
