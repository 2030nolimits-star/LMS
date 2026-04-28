"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Clock, Calendar, Users, PlayCircle, Zap, Loader2 } from "lucide-react"
import { getUpcomingLiveClasses, getStudentCourses } from "@/lib/queries"
import type { LiveClass } from "@/lib/types"
import { toast } from "sonner"

export default function StudentLiveClassesPage() {
  const { currentUser } = useAuth()
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser])

  async function loadData() {
    try {
      const courses = await getStudentCourses(currentUser!.id)
      const courseIds = courses.map(c => c.id)
      if (courseIds.length > 0) {
        const data = await getUpcomingLiveClasses(courseIds)
        setLiveClasses(data)
      } else {
        setLiveClasses([])
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to load live classes")
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) return null

  const liveNow = liveClasses.filter((lc) => lc.status === "live")
  const upcoming = liveClasses.filter((lc) => lc.status === "scheduled")
  const past = liveClasses.filter((lc) => lc.status === "ended")

  const renderClass = (lc: LiveClass) => {
    const isLive = lc.status === "live"
    const isEnded = lc.status === "ended"
    
    return (
      <div key={lc.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isLive ? "bg-rose-500/20 glow-destructive" : isEnded ? "bg-white/5" : "bg-primary/20 glow-primary"}`}>
             {isEnded ? <PlayCircle className="h-6 w-6 text-muted-foreground" /> : <Video className={`h-6 w-6 ${isLive ? "text-rose-400" : "text-primary"}`} />}
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{lc.title}</h3>
                {isLive && <Badge className="bg-rose-500 text-white border-none animate-pulse">LIVE NOW</Badge>}
             </div>
             <p className="text-xs text-muted-foreground mt-0.5">{lc.courseName} · {lc.teacherName}</p>
             <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                   <Calendar className="h-3 w-3" />
                   {new Date(lc.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                   <Clock className="h-3 w-3" />
                   {new Date(lc.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                   <span className="opacity-50">({lc.duration}m)</span>
                </span>
                {isLive && (
                   <span className="flex items-center gap-1 text-emerald-400">
                     <Users className="h-3 w-3" /> Active Session
                   </span>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex shrink-0 border-t border-white/5 pt-3 md:border-t-0 md:pt-0">
          {isLive ? (
            <Link href={`/dashboard/student/live-classes/${lc.id}`} className="w-full md:w-auto">
              <Button size="sm" className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                Join Classroom
              </Button>
            </Link>
          ) : isEnded ? (
            <Button variant="outline" size="sm" className="w-full md:w-auto bg-white/5 border-white/10 hover:bg-white/10" disabled>
               Recording Unavailable
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full md:w-auto bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" disabled>
               Starts Soon
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardShell role="student">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh min-h-[calc(100vh-10rem)]">
        <div className="pointer-events-none absolute -top-10 right-20 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl" />

        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Virtual Classes</h1>
          <p className="text-muted-foreground mt-1">Join interactive live streaming sessions with your instructors.</p>
        </div>

        {liveClasses.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No live classes scheduled</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Classes will appear here once your instructors schedule them.</p>
            </div>
          </div>
        ) : (
          <>
            {liveNow.length > 0 && (
              <div className="flex flex-col gap-3">
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                   <Zap className="h-4 w-4" /> Happening Now
                 </h2>
                 {liveNow.map(renderClass)}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="flex flex-col gap-3">
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mt-4">Upcoming Schedule</h2>
                 {upcoming.map(renderClass)}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-4">Past Sessions</h2>
                 {past.map(renderClass)}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

