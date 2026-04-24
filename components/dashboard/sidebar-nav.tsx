"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"
import {
  BookOpen,
  LayoutDashboard,
  Video,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Bell,
  Users,
  BarChart3,
  Settings,
  FolderOpen,
} from "lucide-react"

const navItems: Record<UserRole, { label: string; href: string; icon: React.ElementType }[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Courses", href: "/dashboard/student/courses", icon: BookOpen },
    { label: "Live Classes", href: "/dashboard/student/live-classes", icon: Video },
    { label: "Attendance", href: "/dashboard/student/attendance", icon: ClipboardCheck },
    { label: "Grades", href: "/dashboard/student/grades", icon: GraduationCap },
    { label: "Chat", href: "/dashboard/student/chat", icon: MessageSquare },
    { label: "Notifications", href: "/dashboard/student/notifications", icon: Bell },
  ],
  teacher: [
    { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { label: "Courses", href: "/dashboard/teacher/courses", icon: BookOpen },
    { label: "Live Classes", href: "/dashboard/teacher/live-classes", icon: Video },
    { label: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardCheck },
    { label: "Grading", href: "/dashboard/teacher/grading", icon: GraduationCap },
    { label: "Materials", href: "/dashboard/teacher/materials", icon: FolderOpen },
    { label: "Chat", href: "/dashboard/teacher/chat", icon: MessageSquare },
    { label: "Notifications", href: "/dashboard/teacher/notifications", icon: Bell },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { label: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
}

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const items = navItems[role]

  return (
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/dashboard/${role}` && pathname.startsWith(`${item.href}/`))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { navItems }
