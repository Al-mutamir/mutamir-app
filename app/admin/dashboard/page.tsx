"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  CreditCard,
  Calendar,
  BarChart3,
  Building2,
  LogOut,
  Settings,
  Shield,
  UserCheck,
} from "lucide-react"
import { getAdminStats } from "@/lib/firebase/admin"
import AdminProtectedRoute from "@/components/admin-protected-route"

interface AdminStats {
  totalUsers: number
  totalAgencies: number
  verifiedAgencies: number
  totalPilgrims: number
  totalBookings: number
  totalPackages: number
  totalRevenue: number
  recentBookings: {
    id: string
    createdAt: any
    totalPrice: number
    paymentStatus: string
  }[]
  pendingVerifications: number
  monthlySummary: any
  distributions: any
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgencies: 0,
    verifiedAgencies: 0,
    totalPilgrims: 0,
    totalBookings: 0,
    totalPackages: 0,
    totalRevenue: 0,
    recentBookings: [],
    pendingVerifications: 0,
    monthlySummary: {},
    distributions: {},
  })
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const adminStats = await getAdminStats()
        setStats(adminStats)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    // Clear admin token
    localStorage.removeItem("admin-token")
    // Redirect to login page
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6 text-primary" />
              Admin Panel
            </h2>
          </div>
          <nav className="mt-6">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Main</div>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/users")}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/agents")}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Agencies
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/packages")}
            >
              <Package className="mr-2 h-5 w-5" />
              Packages
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/bookings")}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Bookings
            </Button>

            <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase">Settings</div>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/settings")}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start px-4 py-2 text-left" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.totalPilgrims} pilgrims, {stats.totalAgencies} agencies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Agencies</p>
                    <p className="text-2xl font-bold">{stats.totalAgencies}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.verifiedAgencies} verified (
                  {Math.round((stats.verifiedAgencies / stats.totalAgencies) * 100) || 0}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Packages</p>
                    <p className="text-2xl font-bold">{stats.totalPackages}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Active packages across all agencies</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">From {stats.totalBookings} bookings</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => router.push("/admin/dashboard/agents")}
              >
                <UserCheck className="h-6 w-6 mb-2" />
                <span>Verify Agencies</span>
                {stats.pendingVerifications > 0 && (
                  <span className="mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {stats.pendingVerifications} pending
                  </span>
                )}
              </Button>
              <Button
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => router.push("/admin/dashboard/packages/create")}
              >
                <Package className="h-6 w-6 mb-2" />
                <span>Create Package</span>
              </Button>
              <Button
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => router.push("/admin/dashboard/users")}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Users</span>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>The latest bookings across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {stats.recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Booking #{booking.id.substring(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.createdAt.seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{booking.totalPrice.toLocaleString()}</p>
                          <p
                            className={`text-sm ${
                              booking.paymentStatus === "paid"
                                ? "text-green-600"
                                : booking.paymentStatus === "partial"
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
