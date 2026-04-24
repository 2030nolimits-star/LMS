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
} from "lucide-react"
import { useEffect, useState } from "react"
import type { ActiveSession } from "@/lib/session-tracker"
import { getActiveSessions } from "@/lib/session-tracker"

// Rich Demo Data for Teacher
const demoCourses = [
  { id: "1", code: "CS301", title: "Data Structures & Algorithms", color: "hsl(270,80%,70%)", students: 38, assignments: [1,2], pending: 12 },
  { id: "2", code: "MATH201", title: "Linear Algebra", color: "hsl(168,84%,45%)", students: 45, assignments: [1], pending: 5 },
]

const demoLiveClasses = [
  { id: "1", title: "Graph Algorithms Deep Dive", courseName: "CS301", status: "live", scheduledAt: new Date().toISOString() },
  { id: "2", title: "Linear Transformations", courseName: "MATH201", status: "scheduled", scheduledAt: new Date(Date.now() + 86400000).toISOString() },
]

export default function TeacherDashboard() {
  const { currentUser } = useAuth()
  const [onlineStudents, setOnlineStudents] = useState<ActiveSession[]>([])
  if (!currentUser) return null

  useEffect(() => {
    const refreshOnlineStudents = () => {
      const sessions = getActiveSessions().filter(
        (session) => session.role === "student" && session.status === "active"
      )
      setOnlineStudents(sessions)
    }

    refreshOnlineStudents()
    const refreshTimer = window.setInterval(refreshOnlineStudents, 15000)

    return () => window.clearInterval(refreshTimer)
  }, [])

  const liveNow = demoLiveClasses.filter(lc => lc.status === "live")
  const upcoming = demoLiveClasses.filter(lc => lc.status === "scheduled")
  
  const totalStudents = demoCourses.reduce((sum, c) => sum + c.students, 0)
  const pendingGrading = demoCourses.reduce((sum, c) => sum + c.pending, 0)

  const statCards = [
    { label: "My Courses", value: demoCourses.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/15", glow: "glow-primary" },
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
              Welcome back, {currentUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s a summary of your teaching activities for today.
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
                       {new Date(lc.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
               {demoCourses.map(course => (
                 <div key={course.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: course.color + "25" }}>
                       <BookOpen className="h-5 w-5" style={{ color: course.color }} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-foreground">{course.code} - {course.title}</p>
                       <p className="text-xs text-muted-foreground">{course.students} Enrolled · {course.assignments.length} Assignments</p>
                     </div>
                   </div>
                   {course.pending > 0 && (
                     <Badge className="bg-amber-500/20 text-amber-400 border-none shrink-0">{course.pending} to grade</Badge>
                   )}
                 </div>
               ))}
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
