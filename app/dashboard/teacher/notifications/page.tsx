"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  GraduationCap, 
  Video, 
  FileText, 
  MessageSquare, 
  Megaphone, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  MoreVertical,
  Clock,
  User as UserIcon,
  MapPin,
  ExternalLink,
  Plus
} from "lucide-react"
import { getNotifications, markNotificationAsRead } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const iconMap = {
  grade:        { icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  class:        { icon: Video,         color: "text-rose-400",    bg: "bg-rose-500/15" },
  material:     { icon: FileText,      color: "text-primary",     bg: "bg-primary/15" },
  message:      { icon: MessageSquare, color: "text-amber-400",   bg: "bg-amber-500/15" },
  announcement: { icon: Megaphone,     color: "text-blue-400",    bg: "bg-blue-500/15" },
  submission:   { icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
}

// Rich demo data for teacher
const richDemoNotifications = [
  {
    id: "rich-1",
    title: "System Update: Exam Portal Open",
    message: "The final exam portal for CSI_5_ADP is now open for configuration. Please set your questions and duration before the weekend.",
    type: "announcement",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    instructor: "Admin System",
    courseCode: "CSI_5_ADP",
    category: "System"
  },
  {
    id: "rich-2",
    title: "New Submissions: Assignment 2",
    message: "12 new students have submitted their 'Graph Algorithms' lab reports. They are awaiting grading.",
    type: "submission",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    instructor: "LMS Automated",
    courseCode: "CS301"
  },
  {
    id: "rich-3",
    title: "Staff Meeting: Room Change",
    message: "The departmental staff meeting scheduled for tomorrow has been moved to the South Wing Lounge.",
    type: "announcement",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    instructor: "Dept Head",
    location: "South Wing Lounge"
  }
]

export default function TeacherNotificationsPage() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeNotif, setActiveNotif] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    try {
      const data = await getNotifications(currentUser!.id);
      const merged = [...data, ...richDemoNotifications].sort((a: any, b: any) => 
        new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
      );
      setNotifications(merged);
      if (merged.length > 0 && !activeNotif) {
        setActiveNotif(merged[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`teacher_notifications_${currentUser.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`
      }, () => {
        loadData();
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser])

  const handleMarkAsRead = async (id: string) => {
    if (id.startsWith('rich-')) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      return;
    }
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      const realUnread = unread.filter(n => !n.id.startsWith('rich-'));
      await Promise.all(realUnread.map(n => markNotificationAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
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
      <div className="relative flex flex-col gap-6 bg-mesh h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute -top-10 left-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Updates on your courses, students, and messages.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
               <Plus className="mr-2 h-4 w-4" /> Create Announcement
            </Button>
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
        </div>

        <div className="flex-1 flex overflow-hidden glass-card" style={{ padding: 0 }}>
          {/* List Pane */}
          <div className="w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col overflow-hidden bg-white/[0.02]">
            <div className="p-4 border-b border-white/10 bg-white/5">
               <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-4 opacity-10" />
                  <p className="text-xs">No notifications yet.</p>
                </div>
              ) : (
                notifications.map(n => {
                  const type = n.type || 'announcement';
                  const config = iconMap[type as keyof typeof iconMap] || iconMap.announcement
                  const isActive = activeNotif?.id === n.id;
                  
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        setActiveNotif(n);
                        if (!n.is_read) handleMarkAsRead(n.id);
                      }}
                      className={cn(
                        "p-4 border-b border-white/5 cursor-pointer transition-all relative",
                        isActive ? "bg-primary/10" : "hover:bg-white/5",
                        !n.is_read && "bg-white/[0.03]"
                      )}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      <div className="flex gap-3">
                        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5", !n.is_read && "bg-primary/20 shadow-lg shadow-primary/20")}>
                          <config.icon className={cn("h-4 w-4", !n.is_read ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={cn("text-xs font-semibold truncate", !n.is_read ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </h3>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {getTimeAgo(n.created_at || n.createdAt)}
                          </p>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 text-primary shrink-0 self-center" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Detail Pane */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-white/[0.01]">
            {activeNotif ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/[0.03]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                       <h2 className="text-xl font-bold text-foreground leading-tight">{activeNotif.title}</h2>
                       <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <Clock className="h-3.5 w-3.5" />
                             {getTimeAgo(activeNotif.created_at || activeNotif.createdAt)}
                          </div>
                          {activeNotif.courseCode && (
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] py-0 h-5">
                              {activeNotif.courseCode}
                            </Badge>
                          )}
                       </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/10">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="mx-auto max-w-3xl">
                    <div className="mb-8 flex flex-col gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {(activeNotif.instructor || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{activeNotif.instructor || "System Alert"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activeNotif.created_at || activeNotif.createdAt).toLocaleDateString("en-GB", { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeNotif.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded-lg">
                            <MapPin className="h-3.5 w-3.5 text-rose-400" />
                            <span>Location: <span className="text-foreground font-medium">{activeNotif.location}</span></span>
                          </div>
                        )}
                        {activeNotif.category && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded-lg">
                            <Megaphone className="h-3.5 w-3.5 text-blue-400" />
                            <span>Category: <span className="text-foreground font-medium">{activeNotif.category}</span></span>
                          </div>
                        )}
                      </div>

                      <div className="text-base text-foreground leading-relaxed font-light whitespace-pre-wrap pt-2">
                        {activeNotif.message}
                      </div>

                      <div className="pt-4 flex gap-3 border-t border-white/5">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                          <ExternalLink className="mr-2 h-3.5 w-3.5" /> View source details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
                <Bell className="h-16 w-16 mb-4 text-muted-foreground/20" />
                <h3 className="text-lg font-medium text-muted-foreground">Select a notification to view details</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
