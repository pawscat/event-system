import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserAuthData } from '@/lib/actions/auth-actions'

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authData = await getUserAuthData()
    if (!authData || authData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admin can delete global users.' }, { status: 403 })
    }

    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Initialize Supabase admin client to delete auth user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Wait! Supabase Auth admin delete requires the Auth User ID (auth.uid()), not the public.users ID.
    // So we first need to fetch the auth_provider_id from public.users.
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .select('auth_provider_id')
      .eq('id', userId)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Delete user from Supabase Auth if they have an auth_provider_id
    if (userRecord.auth_provider_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userRecord.auth_provider_id)
      
      if (authError) {
        console.error('Failed to delete auth user:', authError)
        // Proceed to delete public record anyway
      }
    }

    // Delete from public.users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Failed to delete public user:', dbError)
      return NextResponse.json({ error: 'Failed to delete user record from database' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE User Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
