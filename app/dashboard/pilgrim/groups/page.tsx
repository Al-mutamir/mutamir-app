"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Search, UserPlus, Calendar, MessageSquare, Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"

export default function PilgrimGroupsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for groups
  const [groups, setGroups] = useState([
    {
      id: "group1",
      name: "Hajj 2025 Group",
      members: 12,
      type: "hajj",
      status: "active",
      lastActivity: "2 hours ago",
      avatar: "/images/hajj-group.png",
    },
    {
      id: "group2",
      name: "Umrah December 2025",
      members: 8,
      type: "umrah",
      status: "planning",
      lastActivity: "1 day ago",
      avatar: "/images/umrah-group.png",
    },
  ])

  return (
    <ProtectedRoute requiredRole="pilgrim">
      <DashboardLayout
        userType="pilgrim"
        title="Pilgrim Groups"
        description="Connect with other pilgrims and plan your journey together"
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                  <DialogDescription>
                    Create a group to connect with other pilgrims and plan your journey together.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="group-name" className="text-sm font-medium">
                      Group Name
                    </label>
                    <Input id="group-name" placeholder="Enter group name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="group-type" className="text-sm font-medium">
                      Group Type
                    </label>
                    <select id="group-type" className="w-full p-2 border rounded-md">
                      <option value="hajj">Hajj Group</option>
                      <option value="umrah">Umrah Group</option>
                      <option value="general">General Discussion</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="group-description" className="text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="group-description"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Describe the purpose of your group"
                    ></textarea>
                  </div>
                  <Button className="w-full">Create Group</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search groups..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Find Groups
            </Button>
          </div>

          <Tabs defaultValue="mygroups" className="w-full">
            <TabsList>
              <TabsTrigger value="mygroups">My Groups</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>

            <TabsContent value="mygroups" className="mt-6">
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <Card key={group.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                            <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription>{group.members} members</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex justify-between items-center mb-3">
                          <Badge
                            variant={group.status === "active" ? "default" : "secondary"}
                            className={
                              group.status === "active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }
                          >
                            {group.status === "active" ? "Active" : "Planning"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Last active: {group.lastActivity}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Calendar className="h-4 w-4 mr-1" /> Events
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-1" /> Chat
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 border-t">
                        <Button variant="ghost" className="w-full" onClick={() => router.push(`/groups/${group.id}`)}>
                          View Group
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No groups yet</h3>
                  <p className="text-muted-foreground mt-2">
                    You haven't joined any groups yet. Create a group or find one to join.
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Create Group</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create a New Group</DialogTitle>
                          <DialogDescription>
                            Create a group to connect with other pilgrims and plan your journey together.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="group-name-2" className="text-sm font-medium">
                              Group Name
                            </label>
                            <Input id="group-name-2" placeholder="Enter group name" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="group-type-2" className="text-sm font-medium">
                              Group Type
                            </label>
                            <select id="group-type-2" className="w-full p-2 border rounded-md">
                              <option value="hajj">Hajj Group</option>
                              <option value="umrah">Umrah Group</option>
                              <option value="general">General Discussion</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="group-description-2" className="text-sm font-medium">
                              Description
                            </label>
                            <textarea
                              id="group-description-2"
                              className="w-full p-2 border rounded-md"
                              rows={3}
                              placeholder="Describe the purpose of your group"
                            ></textarea>
                          </div>
                          <Button className="w-full">Create Group</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline">Find Groups</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="discover" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discover Groups</CardTitle>
                  <CardDescription>Find groups of pilgrims with similar interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Group discovery coming soon</h3>
                    <p className="text-muted-foreground mt-2">
                      We're working on making it easier to find and join groups of pilgrims.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Invites</CardTitle>
                  <CardDescription>Invitations to join pilgrim groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No invites</h3>
                    <p className="text-muted-foreground mt-2">You don't have any pending group invitations.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
