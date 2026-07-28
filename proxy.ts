import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/setup")
  const isPublicFile = pathname.match(/\.(?:png|svg|jpg|ico|json|txt|css|js|apk)$/)
  const isAdminRoute = pathname.startsWith("/akun") || pathname.startsWith("/stock")

  if (isPublicFile) return NextResponse.next()

  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isAdminRoute && session) {
    const role = session.user.user_metadata?.role
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:png|svg|jpg|ico|json|txt|css|js|apk)$).*)",
  ],
}
