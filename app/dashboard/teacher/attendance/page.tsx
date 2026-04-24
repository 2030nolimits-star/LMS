"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ClipboardCheck, XCircle, Loader2 } from "lucide-react"
import { getTeacherDashboardData } from "@/lib/queries"
import type { Course } from "@/lib/types"
import { courses as mockCourses } from "@/lib/mock-data"

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return;
    async function loadData() {
      try {
        const data = await getTeacherDashboardData(currentUser!.id);
      if (data.courses.length > 0) {
        setCourses(data.courses)
      } else {
        // Fallback for demo: show premium mock courses
        setCourses(mockCourses.slice(0, 2))
      }
    } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData()
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
           {courses.length === 0 && <p className="text-sm text-muted-foreground p-2 col-span-full">No courses found. Create a course first.</p>}
           {courses.map(course => (
              <div key={course.id} className="glass-card p-5">
                 <h3 className="font-semibold text-foreground text-lg">{course.title}</h3>
                 <p className="text-sm text-primary mb-4">{course.code}</p>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-2xl font-bold text-emerald-400">92%</p>
                       <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-2xl font-bold text-foreground">{(course as any).students?.length || 0}</p>
                       <p className="text-xs text-muted-foreground">Total Students</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        <div className="glass-card p-5 mt-4">
           <h2 className="font-semibold text-foreground mb-4">Recent Roll Calls</h2>
           <div className="flex flex-col gap-3">
              <div className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No recent roll calls recorded for your courses.</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardShell>
  )
}
