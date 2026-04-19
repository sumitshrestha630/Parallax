import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session cookies + validate JWT (lighter than getUser() when RS256 JWKS apply).
  const { error } = await supabase.auth.getClaims();
  // Stale or partial cookies cause repeated refresh failures and noisy logs — clear session.
  if (
    error?.code === "refresh_token_not_found" ||
    error?.message?.includes("Refresh Token Not Found")
  ) {
    await supabase.auth.signOut();
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Skip Next.js internals + static assets so dev HMR / chunks do not churn
     * middleware (and auth) on every editor save.
     */
    "/((?!_next/static|_next/image|_next/webpack|__nextjs|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
