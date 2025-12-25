import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes (now including root /)
  if (
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/rewards")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/signup" ||
      req.nextUrl.pathname === "/forgot-password" ||
      req.nextUrl.pathname === "/reset-password") &&
    session
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/rewards/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
