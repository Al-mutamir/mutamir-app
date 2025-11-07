import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define the middleware function
export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const path = request.nextUrl.pathname

  // Get the user role from the cookie
  const userRole = request.cookies.get("user-role")?.value
  const onboardingCompleted = request.cookies.get("onboarding-completed")?.value === "true"

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/forgot-password" ||
    path.startsWith("/about") ||
    path.startsWith("/contact") ||
    path.startsWith("/services") ||
    path.startsWith("/packages") ||
    path.startsWith("/standard-packages") ||
    path.startsWith("/faq") ||
    path.startsWith("/terms") ||
    path.startsWith("/privacy") ||
    path.startsWith("/refund")

  // Check if the path is for dashboard
  const isDashboardPath = path.startsWith("/dashboard")

  // Check if the path is for onboarding
  const isOnboardingPath = path.startsWith("/onboarding")

  // Check if the path is for pilgrim dashboard
  const isPilgrimDashboardPath = path.startsWith("/dashboard/pilgrim")

  // Check if the path is for agency dashboard
  const isAgencyDashboardPath = path.startsWith("/dashboard/agency")

  // Check if the path is for admin dashboard
  const isAdminDashboardPath = path.startsWith("/dashboard/admin")

  // Check if the path is for admin onboarding
  const isAdminOnboardingPath = path.startsWith("/onboarding/admin")

  // NOTE: We no longer perform a server-side redirect to /auth/login when the
  // `user-role` cookie is missing. That caused a redirect loop when the client
  // had just signed in and the AuthProvider hadn't yet set the cookie. Client-
  // side guards (ProtectedRoute) enforce auth and will redirect unauthenticated
  // users to the login page. Keeping this check here makes middleware too eager
  // and interferes with normal client sign-in flows.

  // If the user is logged in and trying to access a public route
  if (userRole && (path === "/auth/login" || path === "/auth/register")) {
    // Redirect to the appropriate dashboard based on role
    if (userRole === "pilgrim") {
      return NextResponse.redirect(new URL("/dashboard/pilgrim", request.url))
    } else if (userRole === "agency") {
      return NextResponse.redirect(new URL("/dashboard/agency", request.url))
    } else if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url))
    }
  }

  // If the user is logged in but hasn't completed onboarding
  if (userRole && !onboardingCompleted && isDashboardPath && !isOnboardingPath) {
    // Redirect to the appropriate onboarding page based on role
    if (userRole === "pilgrim") {
      return NextResponse.redirect(new URL("/onboarding/pilgrim", request.url))
    } else if (userRole === "agency") {
      return NextResponse.redirect(new URL("/onboarding/agency", request.url))
    } else if (userRole === "admin") {
      return NextResponse.redirect(new URL("/onboarding/admin", request.url))
    }
  }

  // If the user is a pilgrim trying to access agency dashboard
  if (userRole === "pilgrim" && isAgencyDashboardPath) {
    return NextResponse.redirect(new URL("/dashboard/pilgrim", request.url))
  }

  // If the user is an agency trying to access pilgrim dashboard
  if (userRole === "agency" && isPilgrimDashboardPath) {
    return NextResponse.redirect(new URL("/dashboard/agency", request.url))
  }

  // If the user is not an admin trying to access admin dashboard or admin onboarding
  if (userRole !== "admin" && (isAdminDashboardPath || isAdminOnboardingPath)) {
    if (userRole === "pilgrim") {
      return NextResponse.redirect(new URL("/dashboard/pilgrim", request.url))
    } else if (userRole === "agency") {
      return NextResponse.redirect(new URL("/dashboard/agency", request.url))
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

// Define which paths this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
