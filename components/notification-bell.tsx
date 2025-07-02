"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase/firebase"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const notificationsRef = collection(db, `users/${user.uid}/notifications`)
    const q = query(notificationsRef, orderBy("timestamp", "desc"), limit(5))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setNotifications(newNotifications)
        setLoading(false)
      },
      (error) => {
        console.error("Error getting notifications:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : unreadCount > 0 ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        {loading ? (
          <DropdownMenuItem className="justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem className="justify-center">No notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id}>{notification.message}</DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
