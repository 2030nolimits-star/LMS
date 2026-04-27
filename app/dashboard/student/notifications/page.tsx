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
  MapPin,
  ExternalLink,
  Search,
  Filter
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
}

// Ultra-high fidelity demo data from the user's screenshot
const richDemoNotifications = [
  {
    id: "rich-1",
    title: "CS101: Week beginning 27/04/2026",
    message: "There is no Introduction to CS lecture or labs this week (or next): the coursework submission has already taken place and the module is complete.\n\nPlease use this time to focus on your other modules and exam preparation.",
    type: "announcement",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 133).toISOString(),
    instructor: "Dr. Sarah Thompson",
    courseCode: "CS101",
    category: "Announcements"
  },
  {
    id: "rich-2",
    title: "MATH201: Need Career support?",
    message: "If you need any career support, guidance or advice on your next steps after university, the Careers team is here to help.\n\nYou can book appointments through the portal or visit us in the Student Union building.",
    type: "announcement",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16.05).toISOString(),
    instructor: "University Careers",
    courseCode: "MATH201",
    category: "Career Support"
  },
  {
    id: "rich-3",
    title: "General: Explore the AI for Learning Course",
    message: "This course is designed to help you understand the basics of AI and how it can be used to enhance your learning experience.",
    type: "announcement",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20.1).toISOString(),
    instructor: "Digital Learning Team",
    courseCode: "LMS-GEN"
  },
  {
    id: "rich-4",
    title: "MATH201: LATE CW SUBMISSION CLOSES SOON",
    message: "The window for late coursework submissions for Calculus II will close in 24 hours. Please ensure your files are uploaded to the correct portal.",
    type: "announcement",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24.9).toISOString(),
    instructor: "Prof. James Brown",
    courseCode: "MATH201"
  }
]

export default function StudentNotificationsPage() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeNotif, setActiveNotif] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
      .channel(`student_notifications_${currentUser.id}`)
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
      <DashboardShell role="student">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  const filteredNotifs = notifications.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute -top-10 left-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Updates from your courses and university services.</p>
          </div>
          <div className="flex items-center gap-3">
             {notifications.some(n => !n.is_read) && (
              <Button 
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground h-9 px-3"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
            <Badge className="bg-primary/20 text-primary border-none py-1.5 px-3">
              {notifications.filter(n => !n.is_read).length} New
            </Badge>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden glass-card" style={{ padding: 0 }}>
          
          {/* List Pane */}
          <div className="w-full md:w-80 lg:w-[400px] border-r border-white/10 flex flex-col overflow-hidden bg-white/[0.02]">
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">RECENT ACTIVITY</h2>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <Filter className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredNotifs.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-4 opacity-10" />
                  <p className="text-sm">No notifications match your search.</p>
                </div>
              ) : (
                filteredNotifs.map(n => {
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
                        "p-5 border-b border-white/5 cursor-pointer transition-all relative group",
                        isActive ? "bg-white/[0.08]" : "hover:bg-white/5",
                        !n.is_read && "bg-primary/[0.03]"
                      )}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      <div className="flex gap-4">
                        <div className={cn(
                          "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                          isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                        )}>
                          <config.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                              {n.courseCode || "General"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {getTimeAgo(n.created_at || n.createdAt)}
                            </span>
                          </div>
                          <h3 className={cn("text-sm font-semibold truncate leading-tight", !n.is_read ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {n.message}
                          </p>
                        </div>
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
                {/* Detail Header */}
                <div className="p-8 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                       <h2 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                         {activeNotif.title}
                       </h2>
                       <div className="flex flex-wrap items-center gap-6 mt-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <Clock className="h-4 w-4 text-primary/50" />
                             {new Date(activeNotif.created_at || activeNotif.createdAt).toLocaleDateString("en-GB", { 
                               weekday: 'long', day: 'numeric', month: 'long'
                             })}
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold py-1">
                                {activeNotif.type || "System"}
                             </Badge>
                             {activeNotif.courseCode && (
                               <Badge variant="outline" className="border-white/10 text-[10px] text-muted-foreground uppercase font-bold py-1">
                                 {activeNotif.courseCode}
                               </Badge>
                             )}
                          </div>
                       </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/10 rounded-xl">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-10 bg-mesh">
                  <div className="mx-auto max-w-3xl">
                    <div className="mb-10 flex flex-col gap-8 p-10 rounded-3xl bg-white/[0.03] border border-white/8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md">
                      
                      {/* Sender Info */}
                      <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                            {(activeNotif.instructor || "S").charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-bold text-foreground leading-none">
                              {activeNotif.instructor || "System Administrator"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Verified Instructor
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Sent At</p>
                          <p className="text-xs font-medium text-foreground">
                            {new Date(activeNotif.created_at || activeNotif.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-rose-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tight">Location</p>
                            <p className="text-foreground font-semibold">{activeNotif.location || "Online Portal"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Megaphone className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tight">Category</p>
                            <p className="text-foreground font-semibold">{activeNotif.category || "General Announcement"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Main Message Body */}
                      <div className="text-lg text-foreground/90 leading-relaxed font-light whitespace-pre-wrap py-4 italic selection:bg-primary/30">
                        {activeNotif.message}
                      </div>

                      {/* Action Footer */}
                      <div className="pt-8 flex flex-wrap gap-4 border-t border-white/5">
                        <Button className="rounded-xl shadow-lg shadow-primary/20">
                          <ExternalLink className="mr-2 h-4 w-4" /> Go to Module
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl">
                          Mark as Important
                        </Button>
                      </div>
                    </div>

                    <div className="mt-8 text-center pb-12">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        You are receiving this because you are enrolled in <span className="text-primary font-bold">{activeNotif.courseCode || "this module"}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Bell className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Select a notification</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Click on an item in the sidebar to read the full message and take actions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
