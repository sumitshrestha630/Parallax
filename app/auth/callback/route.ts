import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      // First-time users go to onboarding; returning users go to intended route or dashboard
      const defaultNext = user?.user_metadata?.onboarding_complete ? '/dashboard' : '/onboarding';
      const next = searchParams.get('next') ?? defaultNext;
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error, or if there's no code, redirect back with error param
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
