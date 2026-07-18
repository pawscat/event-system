import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Define route categories based on instructions
  const isPublicRoute = 
    path === '/' || 
    path.startsWith('/register') || 
    path.startsWith('/ticket') || 
    path === '/privacy-policy'

  const isAuthRoute = 
    path.startsWith('/login') || 
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')

  // Enforce auth on protected routes
  // The only protected routes by default are those that are NOT public and NOT auth
  // Specifically: /dashboard and /api (if it requires auth, though API might handle it itself)
  
  if (!user && !isPublicRoute && !isAuthRoute) {
    // If not logged in and trying to access a private route like /dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    // user is logged in, redirect away from auth pages
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
