"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BookOpen, Video, GraduationCap, ClipboardCheck, Clock,
  ArrowRight, TrendingUp, Zap, Star, Loader2
} from "lucide-react"
import { getStudentCourses, getStudentGrades, getUpcomingLiveClasses, getStudentAttendance } from "@/lib/queries"
import type { Course, LiveClass, Grade } from "@/lib/types"

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
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [attendanceRate, setAttendanceRate] = useState("0%")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return;

    async function loadData() {
      try {
        const [courseData, gradeData, attData] = await Promise.all([
          getStudentCourses(currentUser!.id),
          getStudentGrades(currentUser!.id),
          getStudentAttendance(currentUser!.id)
        ])
        
        setCourses(courseData)
        setGrades(gradeData)
        
        const totalAtt = attData.length
        const presentAtt = attData.filter(a => a.status === "present").length
        setAttendanceRate(totalAtt > 0 ? `${Math.round((presentAtt / totalAtt) * 100)}%` : "N/A")

        if (courseData.length > 0) {
          const lcData = await getUpcomingLiveClasses(courseData.map(c => c.id))
          setLiveClasses(lcData)
        }
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser])

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

  const avgGradeNum = grades.length > 0 
    ? Math.round(grades.reduce((s, g) => s + (g.score / (g.maxScore || 100)) * 100, 0) / grades.length)
    : 0;
  
  const avgGradeText = grades.length > 0 ? `${avgGradeNum}%` : "N/A";

  const statCards = [
    { label: "Enrolled Courses",   value: courses.length, icon: BookOpen,      color: "text-primary",     bg: "bg-primary/15",     glow: "glow-primary"     },
    { label: "Avg. Grade",          value: avgGradeText,     icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15", glow: "glow-success"     },
    { label: "Attendance",          value: attendanceRate,              icon: ClipboardCheck,color: "text-amber-400",   bg: "bg-amber-500/15",   glow: "glow-warning"     },
    { label: "Upcoming Classes",    value: liveClasses.length, icon: Video,    color: "text-rose-400",    bg: "bg-rose-500/15",    glow: "glow-destructive" },
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
            <span className="text-sm font-medium">GPA {(avgGradeNum / 25).toFixed(1)}</span>
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
              {liveClasses.length === 0 && <p className="text-sm text-muted-foreground p-2">No upcoming live classes.</p>}
              {liveClasses.slice(0,4).map((lc) => (
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
              {courses.length === 0 && <p className="text-sm text-muted-foreground p-2">You are not enrolled in any courses.</p>}
              {courses.slice(0,4).map((course) => {
                // Approximate progress based on assignments
                const assignments = course.assignments || [];
                const submitted = grades.filter(g => g.courseCode === course.code).length;
                const progress = assignments.length > 0 ? Math.round((submitted / assignments.length) * 100) : 0;

                return (
                  <div key={course.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: course.color || "#ccc" }} />
                        <div>
                          <p className="text-sm font-medium text-foreground leading-none">{course.code}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{course.title}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, backgroundColor: course.color || "#ccc" }}
                      />
                    </div>
                  </div>
                )
              })}
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
          {grades.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No grades posted yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {grades.slice(0,4).map((grade) => {
                const pct = Math.round((grade.score / (grade.maxScore || 100)) * 100)
                const letter = getLetterGrade(pct)
                const color = pct >= 90 ? "text-emerald-400" : pct >= 75 ? "text-amber-400" : "text-rose-400"
                return (
                  <div key={grade.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/8 text-lg font-bold ${color}`}>
                      {letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{grade.assignmentTitle}</p>
                      <p className="text-xs text-muted-foreground">{grade.courseName}</p>
                    </div>
                    <span className={`text-sm font-bold ${color} shrink-0`}>{grade.score}/{grade.maxScore}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  )
}
