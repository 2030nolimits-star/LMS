"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Clock, Calendar, Users, Zap, PlayCircle } from "lucide-react"

const demoLiveClasses = [
  { id: "lc1", title: "Graph Algorithms Deep Dive", courseName: "Data Structures & Algorithms", status: "live", scheduledAt: new Date().toISOString(), duration: 90, attendees: 35 },
  { id: "lc2", title: "Linear Transformations", courseName: "Linear Algebra", status: "scheduled", scheduledAt: new Date(Date.now() + 86400000).toISOString(), duration: 60, attendees: 0 },
  { id: "lc5", title: "Intro to Trees", courseName: "Data Structures & Algorithms", status: "ended", scheduledAt: new Date(Date.now() - 400000000).toISOString(), duration: 75, attendees: 38 },
]

export default function TeacherLiveClassesPage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  const liveNow = demoLiveClasses.filter(lc => lc.status === "live")
  const upcoming = demoLiveClasses.filter(lc => lc.status === "scheduled")
  const past = demoLiveClasses.filter(lc => lc.status === "ended")

  const renderClass = (lc: any) => {
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
             <p className="text-xs text-muted-foreground mt-0.5">{lc.courseName}</p>
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
                {(isLive || isEnded) && (
                   <span className="flex items-center gap-1 text-emerald-400">
                     <Users className="h-3 w-3" /> {lc.attendees} Attendees
                   </span>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex shrink-0 border-t border-white/5 pt-3 md:border-t-0 md:pt-0">
          {isLive ? (
            <Link href={`/dashboard/teacher/live-classes/${lc.id}`} className="w-full md:w-auto">
              <Button size="sm" className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                Manage Class
              </Button>
            </Link>
          ) : isEnded ? (
            <Link href={`/dashboard/teacher/live-classes/${lc.id}`} className="w-full md:w-auto">
              <Button variant="outline" size="sm" className="w-full md:w-auto bg-white/5 border-white/10 hover:bg-white/10">
                 View Recording
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <Link href={`/dashboard/teacher/live-classes/${lc.id}`} className="flex-1 md:w-auto">
                <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10">
                   Edit
                </Button>
              </Link>
              <Link href={`/dashboard/teacher/live-classes/${lc.id}`} className="flex-1 md:w-auto">
                <Button size="sm" className="w-full bg-primary text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-primary/90">
                   Start Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 right-20 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Virtual Classes</h1>
            <p className="text-muted-foreground mt-1">Host interactive sessions and manage recordings.</p>
          </div>
          <Link href="/dashboard/teacher/live-classes/lc2">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Schedule Class
            </Button>
          </Link>
        </div>

        {liveNow.length > 0 && (
          <div className="flex flex-col gap-3">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
               <Zap className="h-4 w-4" /> Live Now
             </h2>
             {liveNow.map(renderClass)}
          </div>
        )}

        <div className="flex flex-col gap-3">
           <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mt-4">Upcoming Schedule</h2>
           {upcoming.map(renderClass)}
        </div>

        <div className="flex flex-col gap-3">
           <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-4">Past Sessions</h2>
           {past.map(renderClass)}
        </div>
      </div>
    </DashboardShell>
  )
}
