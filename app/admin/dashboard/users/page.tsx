"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Package,
  Calendar,
  BarChart3,
  Building2,
  LogOut,
  Settings,
  Shield,
  Search,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react"
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  createAdminUser, // Import createAdminUser
} from "@/lib/firebase/admin"
import AdminProtectedRoute from "@/components/admin-protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | "pilgrim" | "agency" | "admin">("pilgrim") // Set default value to "pilgrim"
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    email: "",
    displayName: "",
    role: "pilgrim",
    password: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const allUsers = await getAllUsers()
        setUsers(allUsers)
        setFilteredUsers(allUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search term and selected role
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, selectedRole, users])

  const handleLogout = () => {
    localStorage.removeItem("admin-token")
    router.push("/auth/login")
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.uid)

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== selectedUser.uid))

      toast({
        title: "User deleted",
        description: `${selectedUser.displayName || selectedUser.email} has been deleted.`,
        variant: "default",
      })

      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const confirmEditUser = async (newRole: string) => {
    try {
      await updateUserRole(selectedUser.uid, newRole)

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.uid === selectedUser.uid ? { ...user, role: newRole } : user)),
      )

      toast({
        title: "User updated",
        description: `${selectedUser.displayName || selectedUser.email}'s role has been updated to ${newRole}.`,
        variant: "default",
      })

      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleCreateUser = async () => {
    try {
      // Validate form
      if (!newUserData.email || !newUserData.password || !newUserData.role) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      // Create user
      const newUser = await createAdminUser(
        newUserData.email,
        newUserData.password,
        newUserData.role,
        { displayName: newUserData.displayName },
      )

      // Update local state
      setUsers((prevUsers) => [...prevUsers, newUser])

      toast({
        title: "User created",
        description: `${newUserData.displayName || newUserData.email} has been created.`,
        variant: "default",
      })

      // Reset form and close dialog
      setNewUserData({
        email: "",
        displayName: "",
        role: "pilgrim",
        password: "",
      })
      setIsCreateDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      })
    }
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
              className="w-full justify-start px-4 py-2 text-left bg-gray-100"
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-5 w-5" />
              Create User
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value) => setSelectedRole(value || "pilgrim")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pilgrim">Pilgrim</SelectItem>
                <SelectItem value="agency">Agency</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage all users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-gray-100 p-4 font-medium">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No users found</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.uid} className="grid grid-cols-5 p-4 items-center">
                        <div className="font-medium">{user.displayName || "No name"}</div>
                        <div className="text-sm">{user.email}</div>
                        <div>
                          <Badge
                            variant={
                              user.role === "admin" ? "destructive" : user.role === "agency" ? "outline" : "default"
                            }
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={user.onboardingCompleted ? "default" : "secondary"}>
                            {user.onboardingCompleted ? "Active" : "Onboarding"}
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogDescription>
                  Change the role for {selectedUser?.displayName || selectedUser?.email}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  defaultValue={selectedUser?.role || "pilgrim"}
                  onValueChange={(value) => confirmEditUser(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pilgrim">Pilgrim</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedUser?.displayName || selectedUser?.email}? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create User Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the platform</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newUserData.displayName}
                    onChange={(e) => setNewUserData({ ...newUserData, displayName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="col-span-3"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    defaultValue={newUserData.role}
                    onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pilgrim">Pilgrim</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
