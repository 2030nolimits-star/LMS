"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ClipboardCheck, XCircle, Loader2 } from "lucide-react"
import { getTeacherDashboardData, getCourseStudents, submitAttendance } from "@/lib/queries"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Course } from "@/lib/types"
import { courses as mockCourses } from "@/lib/mock-data"

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [courseStudents, setCourseStudents] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, "present" | "absent" | "late">>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  useEffect(() => {
    if (selectedCourseId) {
      getCourseStudents(selectedCourseId).then(students => {
        setCourseStudents(students);
        const initial: any = {};
        students.forEach((s: any) => initial[s.id] = "present");
        setAttendanceData(initial);
      });
    }
  }, [selectedCourseId])

  async function loadData() {
    setLoading(true);
    try {
      const data = await getTeacherDashboardData(currentUser!.id);
      if (data.courses.length > 0) {
        setCourses(data.courses);
        setSelectedCourseId(data.courses[0].id);
      } else {
        setCourses(mockCourses.slice(0, 2));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAttendance = async () => {
    setSubmitting(true);
    try {
      const records = courseStudents.map(student => ({
        student_id: student.id,
        course_id: selectedCourseId,
        date: new Date().toISOString().split('T')[0],
        status: attendanceData[student.id],
        marked_by: currentUser!.id
      }));
      await submitAttendance(records);
      toast.success("Attendance marked successfully!");
      setIsDialogOpen(false);
      loadData();
    } catch (e) {
      toast.error("Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  }

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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 text-black hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Take Attendance</DialogTitle>
              </DialogHeader>
              
              <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Course</label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Roster ({courseStudents.length})</label>
                  <div className="flex flex-col gap-2 mt-2">
                    {courseStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">{student.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground">{student.registration_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant={attendanceData[student.id] === "present" ? "default" : "ghost"}
                            className={attendanceData[student.id] === "present" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"}
                            onClick={() => setAttendanceData({...attendanceData, [student.id]: "present"})}
                          >
                            Present
                          </Button>
                          <Button 
                            size="sm" 
                            variant={attendanceData[student.id] === "absent" ? "default" : "ghost"}
                            className={attendanceData[student.id] === "absent" ? "bg-rose-500 text-white hover:bg-rose-600" : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"}
                            onClick={() => setAttendanceData({...attendanceData, [student.id]: "absent"})}
                          >
                            Absent
                          </Button>
                          <Button 
                            size="sm" 
                            variant={attendanceData[student.id] === "late" ? "default" : "ghost"}
                            className={attendanceData[student.id] === "late" ? "bg-amber-500 text-black hover:bg-amber-600" : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400"}
                            onClick={() => setAttendanceData({...attendanceData, [student.id]: "late"})}
                          >
                            Late
                          </Button>
                        </div>
                      </div>
                    ))}
                    {courseStudents.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No students enrolled in this course.</p>}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleMarkAttendance} disabled={submitting || courseStudents.length === 0}>
                   {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                   Submit Attendance
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
