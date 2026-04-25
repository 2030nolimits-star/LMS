"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BookOpen,
  Users,
  Video,
  ClipboardCheck,
  ArrowRight,
  Clock,
  Zap,
  Star,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import type { ActiveSession } from "@/lib/session-tracker"
import { getActiveSessions } from "@/lib/session-tracker"
import { getTeacherDashboardData, getTeacherLiveClasses } from "@/lib/queries"
import type { Course, LiveClass } from "@/lib/types"
import { courses as mockCourses, liveClasses as mockLiveClasses } from "@/lib/mock-data"

export default function TeacherDashboard() {
  const { currentUser } = useAuth()
  const [onlineStudents, setOnlineStudents] = useState<ActiveSession[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [pendingGrading, setPendingGrading] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return;
    
    async function loadData() {
      try {
        const [dashData, lcData] = await Promise.all([
          getTeacherDashboardData(currentUser!.id),
          getTeacherLiveClasses(currentUser!.id)
        ])
        if (dashData.courses.length > 0 || lcData.length > 0) {
          setCourses(dashData.courses)
          setTotalStudents(dashData.totalStudents)
          setPendingGrading(dashData.pendingGrading)
          setLiveClasses(lcData)
        } else {
          // Fallback for demo: show premium mock data if DB is empty
          setCourses(mockCourses.slice(0, 2))
          setTotalStudents(128)
          setPendingGrading(5)
          setLiveClasses(mockLiveClasses.filter(lc => lc.status !== "ended"))
        }
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const refreshOnlineStudents = () => {
      const sessions = getActiveSessions().filter(
        (session) => session.role === "student"
      )
      setOnlineStudents(sessions)
    }

    refreshOnlineStudents()
    const refreshTimer = window.setInterval(refreshOnlineStudents, 15000)
    
    // Listen for immediate updates from Supabase Realtime
    window.addEventListener('edura-sessions-updated', refreshOnlineStudents)

    return () => {
      window.clearInterval(refreshTimer)
      window.removeEventListener('edura-sessions-updated', refreshOnlineStudents)
    }
  }, [currentUser])

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

  const liveNow = liveClasses.filter(lc => lc.status === "live")
  const upcoming = liveClasses.filter(lc => lc.status === "scheduled")

  const statCards = [
    { label: "My Courses", value: courses.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/15", glow: "glow-primary" },
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/15", glow: "glow-success" },
    { label: "Live / Upcoming", value: `${liveNow.length} / ${upcoming.length}`, icon: Video, color: "text-rose-400", bg: "bg-rose-500/15", glow: "glow-destructive" },
    { label: "Pending Grading", value: pendingGrading, icon: ClipboardCheck, color: "text-amber-400", bg: "bg-amber-500/15", glow: "glow-warning" },
  ]

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-10 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {currentUser.name} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your teaching overview for today.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2">
            <Star className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium">Top Rated Instructor</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.glow}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming classes */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-rose-400" /> My Live Classes
              </h2>
              <Link href="/dashboard/teacher/live-classes">
                <Button variant="ghost" size="sm" className="text-xs">Manage <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {[...liveNow, ...upcoming].length === 0 && <p className="text-sm text-muted-foreground p-2">No active or upcoming live classes.</p>}
              {[...liveNow, ...upcoming].map((lc) => (
                 <div key={lc.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                   <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${lc.status === "live" ? "bg-rose-500/20" : "bg-primary/15"}`}>
                     <Video className={`h-4 w-4 ${lc.status === "live" ? "text-rose-400" : "text-primary"}`} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-foreground truncate">{lc.title}</p>
                     <p className="text-xs text-muted-foreground">{lc.courseName}</p>
                   </div>
                   {lc.status === "live" ? (
                     <Badge className="bg-rose-500 text-white border-none animate-pulse shrink-0">● LIVE</Badge>
                   ) : (
                     <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                       <Clock className="h-3 w-3" />
                       {new Date(lc.scheduledAt || (lc as any).scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                     </div>
                   )}
                 </div>
              ))}
            </div>
          </div>

          {/* My courses summary */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Course Overview
              </h2>
              <Link href="/dashboard/teacher/courses">
                <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
               {courses.length === 0 && <p className="text-sm text-muted-foreground p-2">No courses created yet.</p>}
               {courses.map(course => {
                 const pending = (course.assignments || []).reduce((sum, a) => sum + (a.submissions?.filter((s:any) => s.status === "submitted").length || 0), 0);
                 return (
                   <div key={course.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: (course.color || "#ccc") + "25" }}>
                         <BookOpen className="h-5 w-5" style={{ color: course.color || "#ccc" }} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-foreground">{course.code} - {course.title}</p>
                         <p className="text-xs text-muted-foreground">{(course.students || []).length} Enrolled · {(course.assignments || []).length} Assignments</p>
                       </div>
                     </div>
                     {pending > 0 && (
                       <Badge className="bg-amber-500/20 text-amber-400 border-none shrink-0">{pending} to grade</Badge>
                     )}
                   </div>
                 )
               })}
            </div>
          </div>
        </div>

        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" /> Logged-in Students
            </h2>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">
              {onlineStudents.length} online
            </Badge>
          </div>

          {onlineStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active student sessions right now.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {onlineStudents.slice(0, 8).map((student) => (
                <div
                  key={student.userId}
                  className="rounded-xl bg-white/5 border border-white/8 p-3"
                >
                  <p className="text-sm font-medium text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Last seen {new Date(student.lastSeenAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
