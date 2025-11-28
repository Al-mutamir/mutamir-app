"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { LogoutButton } from "@/components/logout-button"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserProfile } from "@/lib/firebase/firestore"

export function SiteHeader() {
  const pathname = usePathname()
  const { user, userRole, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setMounted(true)

    // Fetch user profile data if user is logged in
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profileData = await getUserProfile(user.uid)
          if (profileData) {
            setUserProfile(profileData)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [user?.uid])

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/services",
      label: "Services",
      active: pathname === "/services",
    },
    {
      href: "/standard-packages",
      label: "Packages",
      active: pathname === "/standard-packages",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },

    {
      href: "/guide",
      label: "Pilgrim Guide",
      active: pathname === "/guide",
    },
  ]

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
  }

  const getDisplayName = () => {
    // For agencies, show handler name if available
    if (userRole === "agency" && userProfile) {
      if (userProfile.handlerFirstName && userProfile.handlerLastName) {
        return `${userProfile.handlerFirstName} ${userProfile.handlerLastName}`.trim()
      } else if (userProfile.handlerFirstName) {
        return userProfile.handlerFirstName
      }
    }

    // For pilgrims, show first and last name if available
    if (userRole === "pilgrim" && userProfile) {
      if (userProfile.firstName && userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim()
      } else if (userProfile.firstName) {
        return userProfile.firstName
      }
    }

    // Fallback to agency name for agencies
    if (userRole === "agency" && userProfile?.agencyName) {
      return userProfile.agencyName
    }

    // Final fallback to user display name or email
    return user?.displayName || user?.email?.split("@")[0] || "User"
  }

  const getDashboardLink = () => {
    // If no authenticated user, send to login. If user exists but role is not set, send to onboarding.
    if (!user) {
      // Try to read role from cookie for immediate navigation if auth hasn't hydrated yet
      const roleFromCookie = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("user-role="))
      const roleValue = roleFromCookie ? roleFromCookie.split("=")[1] : null
      if (roleValue) {
        if (roleValue === "pilgrim") return "/dashboard/pilgrim"
        if (roleValue === "agency") return "/dashboard/agency"
        if (roleValue === "admin") return "/dashboard/admin"
      }
      return "/auth/login"
    }
    if (!userRole) {
      // If role is not yet resolved in context, try cookie fallback so header can navigate
      // correctly before auth has fully hydrated. If still not found, send to pilgrim onboarding.
      const roleFromCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("user-role="))
      const roleValue = roleFromCookie ? roleFromCookie.split("=")[1] : null
      if (roleValue) {
        if (roleValue === "pilgrim") return "/dashboard/pilgrim"
        if (roleValue === "agency") return "/dashboard/agency"
        if (roleValue === "admin") return "/dashboard/admin"
      }
      return "/onboarding/pilgrim"
    }

    switch (userRole) {
      case "pilgrim":
        return "/dashboard/pilgrim"
      case "agency":
        return "/dashboard/agency"
      case "admin":
        return "/dashboard/admin"
      default:
        return "/onboarding/pilgrim"
    }
  }

  // Don't render user-specific content until client-side hydration is complete
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <Image src="/images/logo.png" alt="Almutamir Logo" width={150} height={40} priority />
          </Link>
          <div className="flex-1"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Image src="/images/logo.png" alt="Almutamir Logo" width={150} height={40} priority />
        </Link>
        <nav className="hidden md:flex gap-6 flex-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                route.active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL || `/placeholder.svg?height=32&width=32&text=${getInitials(getDisplayName())}`}
                    />
                    <AvatarFallback>{getInitials(getDisplayName())}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{getDisplayName()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (window.location.href = getDashboardLink())}>
                  Dashboard
                </DropdownMenuItem>
                {userRole === "agency" && (
                  <Link href="/dashboard/agency/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                )}
                {userRole === "pilgrim" && (
                  <Link href="/dashboard/pilgrim/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex justify-center mb-8 mt-4">
              <Image src="/images/logo.png" alt="Almutamir Logo" width={150} height={40} />
            </div>
            <div className="flex flex-col gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    route.active ? "text-foreground" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              {user ? (
                <>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          user.photoURL || `/placeholder.svg?height=32&width=32&text=${getInitials(getDisplayName())}`
                        }
                      />
                      <AvatarFallback>{getInitials(getDisplayName())}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{getDisplayName()}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false)
                      window.location.href = getDashboardLink()
                    }}
                  >
                    Dashboard
                  </Button>
                  {userRole === "agency" && (
                    <Link href="/dashboard/agency/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Profile
                      </Button>
                    </Link>
                  )}
                  {userRole === "pilgrim" && (
                    <Link href="/dashboard/pilgrim/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Profile
                      </Button>
                    </Link>
                  )}
                  <LogoutButton className="w-full" />
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
