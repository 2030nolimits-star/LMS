"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Bell, GraduationCap, Video, FileText, MessageSquare, Megaphone, CheckCircle2, Loader2 } from "lucide-react"
import { getNotifications, markNotificationAsRead } from "@/lib/queries"

const iconMap = {
  grade:        { icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  class:        { icon: Video,         color: "text-rose-400",    bg: "bg-rose-500/15" },
  material:     { icon: FileText,      color: "text-primary",     bg: "bg-primary/15" },
  message:      { icon: MessageSquare, color: "text-amber-400",   bg: "bg-amber-500/15" },
  announcement: { icon: Megaphone,     color: "text-blue-400",    bg: "bg-blue-500/15" },
  submission:   { icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
}

export default function TeacherNotificationsPage() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    try {
      const data = await getNotifications(currentUser!.id);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => markNotificationAsRead(n.id)));
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  }

  if (!currentUser) return null

  if (loading) {
    return (
      <DashboardShell role="teacher">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 left-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Updates on your courses, students, and messages.</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors glass-card px-4 py-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {notifications.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground bg-white/5 rounded-2xl border border-white/5 border-dashed">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>You have no notifications yet.</p>
            </div>
          ) : (
            notifications.map(n => {
              const type = n.type || 'announcement';
              const config = iconMap[type as keyof typeof iconMap] || iconMap.announcement
              const Icon = config.icon
              return (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  className={`glass-card p-5 flex items-start gap-4 transition-all cursor-pointer ${n.is_read ? 'opacity-70 saturate-50 hover:saturate-100 hover:opacity-100' : 'border-white/15 bg-white/10 saas-shadow'}`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bg} ${!n.is_read ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}>
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-base font-semibold ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h3>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(n.createdAt || n.created_at).toLocaleDateString()} at {new Date(n.createdAt || n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  </div>
                  {!n.is_read && <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-2 glow-primary" />}
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
