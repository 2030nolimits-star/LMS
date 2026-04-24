"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  BookOpen, Video, GraduationCap, ClipboardCheck, Clock,
  ArrowRight, TrendingUp, Zap, Star,
} from "lucide-react"

// ─── Rich demo data for live demo ────────────────────────────────────────────
const demoCourses = [
  { id: "1", code: "CS301",  title: "Data Structures & Algorithms", color: "hsl(270,80%,70%)", progress: 78, teacher: "Dr. James Carter" },
  { id: "2", code: "MATH201",title: "Linear Algebra",               color: "hsl(168,84%,45%)", progress: 91, teacher: "Prof. Sarah Kim" },
  { id: "3", code: "CS401",  title: "Machine Learning",             color: "hsl(200,90%,60%)", progress: 64, teacher: "Dr. Ahmed Hassan" },
  { id: "4", code: "PHY101", title: "Engineering Physics",          color: "hsl(38,92%,55%)",  progress: 85, teacher: "Prof. Linda Osei" },
]

const demoGrades = [
  { id: "1", title: "Binary Trees Lab",     course: "CS301",   score: 94, max: 100 },
  { id: "2", title: "Matrix Operations",    course: "MATH201", score: 88, max: 100 },
  { id: "3", title: "Regression Analysis",  course: "CS401",   score: 76, max: 100 },
  { id: "4", title: "Wave Mechanics Quiz",  course: "PHY101",  score: 91, max: 100 },
]

const demoLiveClasses = [
  { id: "1", title: "Graph Algorithms Deep Dive",  course: "CS301",   status: "live",      scheduledAt: new Date().toISOString() },
  { id: "2", title: "Eigenvectors & Eigenvalues",  course: "MATH201", status: "scheduled", scheduledAt: new Date(Date.now() + 86400000).toISOString() },
  { id: "3", title: "Neural Network Backprop",     course: "CS401",   status: "scheduled", scheduledAt: new Date(Date.now() + 172800000).toISOString() },
]

const avgGrade = Math.round(demoGrades.reduce((s, g) => s + (g.score / g.max) * 100, 0) / demoGrades.length)

function getLetterGrade(pct: number) {
  if (pct >= 93) return "A"
  if (pct >= 90) return "A-"
  if (pct >= 87) return "B+"
  if (pct >= 83) return "B"
  if (pct >= 80) return "B-"
  if (pct >= 77) return "C+"
  return "C"
}

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  const statCards = [
    { label: "Enrolled Courses",   value: demoCourses.length, icon: BookOpen,      color: "text-primary",     bg: "bg-primary/15",     glow: "glow-primary"     },
    { label: "Avg. Grade",          value: `${avgGrade}%`,     icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15", glow: "glow-success"     },
    { label: "Attendance",          value: "92%",              icon: ClipboardCheck,color: "text-amber-400",   bg: "bg-amber-500/15",   glow: "glow-warning"     },
    { label: "Upcoming Classes",    value: demoLiveClasses.length, icon: Video,    color: "text-rose-400",    bg: "bg-rose-500/15",    glow: "glow-destructive" },
  ]

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-10 w-56 h-56 rounded-full bg-emerald-500/8 blur-3xl" />

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {currentUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your academic overview for this semester.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">GPA 3.7</span>
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
          {/* Live Classes */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-rose-400" /> Live &amp; Upcoming Classes
              </h2>
              <Link href="/dashboard/student/live-classes">
                <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {demoLiveClasses.map((lc) => (
                <div key={lc.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${lc.status === "live" ? "bg-rose-500/20" : "bg-primary/15"}`}>
                    <Video className={`h-4 w-4 ${lc.status === "live" ? "text-rose-400" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lc.title}</p>
                    <p className="text-xs text-muted-foreground">{lc.course}</p>
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

          {/* Course Progress */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> My Courses
              </h2>
              <Link href="/dashboard/student/courses">
                <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {demoCourses.map((course) => (
                <div key={course.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                      <div>
                        <p className="text-sm font-medium text-foreground leading-none">{course.code}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{course.title}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Grades */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Recent Grades
            </h2>
            <Link href="/dashboard/student/grades">
              <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {demoGrades.map((grade) => {
              const pct = Math.round((grade.score / grade.max) * 100)
              const letter = getLetterGrade(pct)
              const color = pct >= 90 ? "text-emerald-400" : pct >= 75 ? "text-amber-400" : "text-rose-400"
              return (
                <div key={grade.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/8 text-lg font-bold ${color}`}>
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{grade.title}</p>
                    <p className="text-xs text-muted-foreground">{grade.course}</p>
                  </div>
                  <span className={`text-sm font-bold ${color} shrink-0`}>{grade.score}/{grade.max}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
