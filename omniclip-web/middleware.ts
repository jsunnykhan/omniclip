import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin")
  const isOnAuth = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/api/auth")

  // If on admin routes and not logged in, redirect to login
  if (isOnAdmin && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // If logged in and NOT on admin routes (except auth routes like logout), redirect to admin
  if (isLoggedIn && !isOnAdmin && !isOnAuth) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
