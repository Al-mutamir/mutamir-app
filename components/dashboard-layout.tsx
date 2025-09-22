"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  History,
  CreditCard,
  Users,
  Building,
  User,
  Menu,
  X,
  Settings,
  PiggyBank,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { LogoutButton } from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"

// Update the DashboardLayout component to include a title prop
interface DashboardLayoutProps {
  children: React.ReactNode
  userType: "pilgrim" | "agency" | "admin"
  title?: string
  description?: string
}

export default function DashboardLayout({ children, userType, title, description }: DashboardLayoutProps) {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Handle navigation items based on user type
  const getPilgrimNavItems = () => [
    {
      title: "Dashboard",
      href: "/dashboard/pilgrim",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard/pilgrim",
    },
    {
      title: "Bookings",
      href: "/dashboard/pilgrim/bookings",
      icon: Package,
      isActive: pathname.startsWith("/dashboard/pilgrim/bookings"),
    },
    {
      title: "History",
      href: "/dashboard/pilgrim/history",
      icon: History,
      isActive: pathname === "/dashboard/pilgrim/history",
    },
    {
      title: "Savings",
      href: "/dashboard/pilgrim/savings",
      icon: PiggyBank,
      isActive: pathname === "/dashboard/pilgrim/savings",
    },
    {
      title: "Profile",
      href: "/dashboard/pilgrim/profile",
      icon: User,
      isActive: pathname === "/dashboard/pilgrim/profile",
    },
    // Removed Groups option as requested
  ]

  // Update the getAgencyNavItems function to include all agency dashboard pages
  const getAgencyNavItems = () => [
    {
      title: "Dashboard",
      href: "/dashboard/agency",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard/agency",
    },
    // Removed Packages option as requested
    {
      title: "Clients",
      href: "/dashboard/agency/clients",
      icon: Users,
      isActive: pathname === "/dashboard/agency/clients",
    },
    {
      title: "Offerings",
      href: "/dashboard/agency/offerings",
      icon: Building,
      isActive: pathname === "/dashboard/agency/offerings",
    },
    {
      title: "History",
      href: "/dashboard/agency/history",
      icon: History,
      isActive: pathname === "/dashboard/agency/history",
    },
    {
      title: "Profile",
      href: "/dashboard/agency/profile",
      icon: User,
      isActive: pathname === "/dashboard/agency/profile",
    },
    {
      title: "Settings",
      href: "/dashboard/agency/settings",
      icon: Settings,
      isActive: pathname === "/dashboard/agency/settings",
    },
  ]

  const getAdminNavItems = () => [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard/admin",
    },
    {
      title: "Agencies",
      href: "/dashboard/admin/agencies",
      icon: Building,
      isActive: pathname.startsWith("/dashboard/admin/agencies"),
    },
    {
      title: "Pilgrims",
      href: "/dashboard/admin/pilgrims",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/admin/pilgrims"),
    },
    {
      title: "Packages",
      href: "/dashboard/admin/packages",
      icon: Package,
      isActive: pathname.startsWith("/dashboard/admin/packages"),
    },
    {
      title: "Bookings",
      href: "/dashboard/admin/bookings",
      icon: History,
      isActive: pathname.startsWith("/dashboard/admin/bookings"),
    },
    {
      title: "Payments",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
      isActive: pathname.startsWith("/dashboard/admin/payments"),
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
      isActive: pathname === "/dashboard/admin/settings",
    },
  ]

  // Select the appropriate navigation items
  const getNavItems = () => {
    switch (userType) {
      case "pilgrim":
        return getPilgrimNavItems()
      case "agency":
        return getAgencyNavItems()
      case "admin":
        return getAdminNavItems()
      default:
        return []
    }
  }

  const navItems = getNavItems()

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      {/* <SiteHeader /> */}
  <div className="flex flex-1">
        {/* Desktop Sidebar - fixed */}
        <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-30 border-r bg-background">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 py-4">
              <div className="px-4 py-2 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined } />
                  <AvatarFallback>{user?.role?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium leading-none">{user?.role || "User"}</span>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-10rem)] px-2 py-4">
                <nav className="flex flex-col gap-1 px-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        item.isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </ScrollArea>
            </div>
            <div className="border-t p-4">
              <LogoutButton className="w-full" />
            </div>
          </div>
        </aside>
        {/* Main content - add left margin for fixed sidebar */}
        <div className="flex-1 lg:ml-64">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Button
              size="icon"
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              ></div>
              {/* Sidebar */}
              <div className="fixed inset-y-0 left-0 z-40 w-72 bg-background shadow-xl">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium leading-none">{user?.displayName || "User"}</span>
                        <span className="text-xs text-muted-foreground">{userType}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  <ScrollArea className="p-4 flex-1">
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                            item.isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      ))}
                    </nav>
                  </ScrollArea>
                  <div className="border-t p-4">
                    <LogoutButton className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Main Content - fixed width dashboard */}
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 flex justify-center">
            <div className="w-full max-w-4xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
