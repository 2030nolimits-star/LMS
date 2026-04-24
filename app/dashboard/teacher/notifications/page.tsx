"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MessageSquare, GraduationCap, Users, Megaphone } from "lucide-react"

const demoNotifications = [
  { id: "1", type: "message",      title: "New Message",           content: "Trushi Patel sent you a message regarding 'Binary Trees Lab'.", time: "1 hour ago", isRead: false },
  { id: "2", type: "submission",   title: "New Submissions",       content: "15 students submitted the 'Graph Traversal Task'.", time: "3 hours ago", isRead: false },
  { id: "3", type: "announcement", title: "System Maintenance",    content: "Scheduled downtime on Saturday at 2:00 AM.", time: "1 day ago", isRead: true },
  { id: "4", type: "message",      title: "New Message",           content: "Alex Johnson asked a question in the CS301 forum.", time: "2 days ago", isRead: true },
]

const iconMap = {
  message:      { icon: MessageSquare, color: "text-amber-400",   bg: "bg-amber-500/15" },
  submission:   { icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  announcement: { icon: Megaphone,     color: "text-blue-400",    bg: "bg-blue-500/15" },
}

export default function TeacherNotificationsPage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 left-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Updates on your courses, students, and messages.</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors glass-card px-4 py-2">
            <CheckCircle2 className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {demoNotifications.map(n => {
            const config = iconMap[n.type as keyof typeof iconMap] || iconMap.announcement
            const Icon = config.icon
            return (
              <div key={n.id} className={`glass-card p-5 flex items-start gap-4 transition-all ${n.isRead ? 'opacity-70 saturate-50 hover:saturate-100 hover:opacity-100' : 'border-white/15 bg-white/10 saas-shadow'}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bg} ${!n.isRead ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-base font-semibold ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                </div>
                {!n.isRead && <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-2 glow-primary" />}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
