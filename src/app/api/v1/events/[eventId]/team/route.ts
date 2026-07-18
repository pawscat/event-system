import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserAuthData } from '@/lib/actions/auth-actions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const { email, full_name, password, role } = await request.json()

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Role validation
    if (!['event_admin', 'registration_admin', 'scanner_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check permissions
    const authData = await getUserAuthData()
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isSuperAdmin = authData.role === 'super_admin'
    const isEventAdmin = authData.assignments.some(a => a.event_id === eventId && a.role === 'event_admin')

    if (!isSuperAdmin && !isEventAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin Event can only create/assign registration & scanner admins
    if (!isSuperAdmin && role === 'event_admin') {
      return NextResponse.json({ error: 'Event Admins cannot create or assign other Event Admins' }, { status: 403 })
    }

    // Admin Event can only assign to their OWN event, which is implicitly checked by `isEventAdmin` for this `eventId`

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Check if user already exists in public.users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    let userIdToAssign = existingUser?.id

    if (!existingUser) {
      if (!password) {
        return NextResponse.json({ error: 'Password required for new user' }, { status: 400 })
      }

      // Create new user
      const { data: authDataNew, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
      })

      if (authError || !authDataNew.user) {
        return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
      }

      // Insert to public.users
      const { data: newUserDb, error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_provider_id: authDataNew.user.id,
          email,
          full_name,
          role: 'admin',
          status: 'active'
        })
        .select()
        .single()

      if (dbError || !newUserDb) {
        await supabaseAdmin.auth.admin.deleteUser(authDataNew.user.id)
        return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 })
      }

      userIdToAssign = newUserDb.id
    }

    // 2. Enforce: User can only have ONE active assignment across ALL events
    const { data: activeAssignments } = await supabaseAdmin
      .from('event_staff_assignments')
      .select('event_id, role')
      .eq('user_id', userIdToAssign)
      .eq('status', 'active')

    if (activeAssignments && activeAssignments.length > 0) {
      // Return specific error required by prompt
      return NextResponse.json({ 
        error: 'Akun ini telah ditugaskan pada event lain. Satu akun admin hanya dapat menangani satu event aktif.' 
      }, { status: 409 })
    }

    // 3. Assign User
    const { error: assignError } = await supabaseAdmin
      .from('event_staff_assignments')
      .insert({
        event_id: eventId,
        user_id: userIdToAssign,
        role: role,
        status: 'active',
        assigned_by: authData.id
      })

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 })
    }

    // Audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: authData.id,
        event_id: eventId,
        action: 'assign_staff',
        details: { assigned_user: userIdToAssign, role }
      })

    return NextResponse.json({ success: true, message: 'Admin assigned successfully' })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// GET list of staff for this event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
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

    const { data, error } = await supabaseAdmin
      .from('event_staff_assignments')
      .select(`
        id,
        role,
        status,
        assigned_at,
        users!inner (id, email, full_name, status)
      `)
      .eq('event_id', eventId)
      .order('assigned_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
