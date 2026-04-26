"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Clock, BookOpen, Loader2 } from "lucide-react"
import { getStudentAttendance, getStudentCourses } from "@/lib/queries"
import type { Course } from "@/lib/types"
import { courses as mockCourses, attendanceRecords as mockAttRecords } from "@/lib/mock-data"

const statusConfig = {
  present: { label: "Present", icon: CheckCircle2, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/15" },
  absent:  { label: "Absent",  icon: XCircle,      colorClass: "text-rose-400",    bgClass: "bg-rose-500/15" },
  late:    { label: "Late",    icon: Clock,        colorClass: "text-amber-400",   bgClass: "bg-amber-500/15" },
}

export default function StudentAttendancePage() {
  const { currentUser } = useAuth()
  const [attendance, setAttendance] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return;
    async function loadData() {
      try {
        const [attData, courseData] = await Promise.all([
          getStudentAttendance(currentUser!.id),
          getStudentCourses(currentUser!.id)
        ])
        
        if (attData.length > 0 || courseData.length > 0) {
          setAttendance(attData)
          setCourses(courseData)
        } else {
          // Fallback for demo: dynamic mock data based on logged-in user
          setAttendance(mockAttRecords.filter(a => a.studentId === currentUser!.id))
          setCourses(mockCourses.filter(c => currentUser!.enrolledCourses?.includes(c.id)).slice(0, 4))
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

  const overallPresent = attendance.filter((a) => a.status === "present").length
  const overallRate = attendance.length > 0 ? Math.round((overallPresent / attendance.length) * 100) : 0

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 right-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div>
           <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
           <p className="text-muted-foreground mt-1">Track your attendance records across all enrolled courses.</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
           <div className="glass-card p-5 text-center flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-xl" />
             <p className="text-4xl font-bold text-primary">{attendance.length > 0 ? `${overallRate}%` : "N/A"}</p>
             <p className="text-sm text-muted-foreground mt-1">Overall Attendance</p>
             <Progress value={overallRate} className="mt-4 h-2 w-full max-w-[200px]" />
           </div>
           <div className="glass-card p-5 flex items-center justify-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 glow-success">
               <CheckCircle2 className="h-6 w-6 text-emerald-400" />
             </div>
             <div>
               <p className="text-3xl font-bold text-foreground">{overallPresent}</p>
               <p className="text-sm text-muted-foreground">Classes Attended</p>
             </div>
           </div>
           <div className="glass-card p-5 flex items-center justify-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 glow-destructive">
               <XCircle className="h-6 w-6 text-rose-400" />
             </div>
             <div>
               <p className="text-3xl font-bold text-foreground">
                 {attendance.filter((a) => a.status === "absent").length}
               </p>
               <p className="text-sm text-muted-foreground">Classes Missed</p>
             </div>
           </div>
        </div>

        {/* Per-Course Breakdown */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {courses.length === 0 && <p className="text-sm text-muted-foreground p-2 col-span-full">No enrolled courses found.</p>}
          {courses.map((course) => {
            const courseAtt = attendance.filter((a) => a.course_id === course.id)
            const present = courseAtt.filter((a) => a.status === "present").length
            const rate = courseAtt.length > 0 ? Math.round((present / courseAtt.length) * 100) : 0
            
            return (
              <div key={course.id} className="glass-card p-4">
                <p className="text-xs font-semibold text-primary">{course.code}</p>
                <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-2xl font-bold text-foreground">{courseAtt.length > 0 ? `${rate}%` : "N/A"}</span>
                  <span className="text-xs text-muted-foreground mb-1">
                    {present}/{courseAtt.length} classes
                  </span>
                </div>
                <Progress value={rate} className="mt-2 h-1.5" />
              </div>
            )
          })}
        </div>

        {/* Detailed Records List */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Recent Records
          </h2>
          {attendance.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No attendance records found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {attendance.map((record) => {
                const config = statusConfig[record.status as keyof typeof statusConfig] || statusConfig.present
                const Icon = config.icon
                return (
                   <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 ${config.bgClass}`}>
                           <Icon className={`h-5 w-5 ${config.colorClass}`} />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-foreground">{record.courseName}</p>
                           <p className="text-xs text-muted-foreground">
                             {new Date(record.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                           </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 sm:ml-auto pl-12 sm:pl-0">
                         <span className="text-xs text-muted-foreground text-right min-w-[120px]">Marked by {record.markedBy}</span>
                         <Badge className={`border-none ${config.bgClass} ${config.colorClass}`}>
                           {config.label}
                         </Badge>
                      </div>
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
