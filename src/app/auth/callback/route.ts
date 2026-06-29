import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Sanitize the redirect target to prevent open redirect attacks.
  // Only allow relative paths that start with / and do not contain //.
  const safeNext =
    typeof next === 'string' &&
    next.startsWith('/') &&
    !next.startsWith('//')
      ? next
      : '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=AuthCallbackError`);
}
