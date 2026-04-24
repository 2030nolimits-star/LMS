"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, Menu, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { getUnreadNotificationCount } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

interface DashboardHeaderProps {
  onMenuToggle: () => void
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const { currentUser, logout, switchRole } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) return;
    
    // Initial fetch
    getUnreadNotificationCount(currentUser.id).then(setUnreadCount);

    // Subscribe to real-time notification changes
    const channel = supabase
      .channel(`header_notifications_${currentUser.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`
      }, () => {
        getUnreadNotificationCount(currentUser.id).then(setUnreadCount);
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser])


  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!currentUser) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border glass border-x-0 border-t-0 shadow-none px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Decorative effect */}
      <div className="absolute top-3 left-1/3 w-10 h-10 bg-primary/5 blur-2xl rounded-full pointer-events-none z-0 hidden md:block" />

      <div className="flex-1" />

      {/* Role switcher (demo only) */}
      <div className="hidden items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5 md:flex">
        {(["student", "teacher", "admin"] as const).map((role) => (
          <button
            key={role}
            onClick={() => {
              switchRole(role)
              router.push(`/dashboard/${role}`)
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              currentUser.role === role
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-black/5"
        onClick={() =>
          router.push(`/dashboard/${currentUser.role}/notifications`)
        }
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] bg-secondary text-secondary-foreground border-none">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <ThemeToggle />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 pl-2 pr-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {currentUser.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline-block">
              {currentUser.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span>{currentUser.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {currentUser.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          {/* Mobile role switcher */}
          <div className="md:hidden">
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Role (Demo)
            </DropdownMenuLabel>
            {(["student", "teacher", "admin"] as const).map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => {
                  switchRole(role)
                  router.push(`/dashboard/${role}`)
                }}
                className="capitalize"
              >
                {role}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
