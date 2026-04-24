"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ClipboardCheck, Users, XCircle, Clock } from "lucide-react"

const demoCoursesData = [
  { id: "1", code: "CS301", title: "Data Structures & Algorithms", totalActiveStudents: 38 },
  { id: "2", code: "MATH201", title: "Linear Algebra", totalActiveStudents: 45 },
]

const demoRecords = [
  { id: "r1", date: new Date().toISOString(), course: "CS301", present: 35, absent: 3, late: 0, markedBy: "Me" },
  { id: "r2", date: new Date(Date.now() - 86400000).toISOString(), course: "MATH201", present: 40, absent: 5, late: 0, markedBy: "Me" },
  { id: "r3", date: new Date(Date.now() - 172800000).toISOString(), course: "CS301", present: 36, absent: 2, late: 0, markedBy: "Me" },
]

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute top-40 right-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">Review aggregated attendance and take roll call.</p>
          </div>
          <Button className="bg-amber-500 text-black hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Take Attendance
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
           {demoCoursesData.map(course => (
              <div key={course.id} className="glass-card p-5">
                 <h3 className="font-semibold text-foreground text-lg">{course.title}</h3>
                 <p className="text-sm text-primary mb-4">{course.code}</p>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-2xl font-bold text-emerald-400">92%</p>
                       <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-2xl font-bold text-foreground">{course.totalActiveStudents}</p>
                       <p className="text-xs text-muted-foreground">Total Students</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        <div className="glass-card p-5 mt-4">
           <h2 className="font-semibold text-foreground mb-4">Recent Roll Calls</h2>
           <div className="flex flex-col gap-3">
              {demoRecords.map(record => (
                 <div key={record.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-xl bg-white/5 border border-white/8 p-4 hover:bg-white/10 transition-colors gap-4 md:gap-0">
                    <div>
                       <p className="text-sm font-semibold text-foreground">{record.course}</p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                       </p>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1.5 min-w-[70px]">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium">{record.present}</span>
                       </div>
                       <div className="flex items-center gap-1.5 min-w-[70px]">
                          <XCircle className="h-4 w-4 text-rose-400" />
                          <span className="text-sm font-medium">{record.absent}</span>
                       </div>
                    </div>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10">View Report</Button>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </DashboardShell>
  )
}
