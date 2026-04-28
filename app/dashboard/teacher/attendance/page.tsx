"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  CheckCircle2, 
  ClipboardCheck, 
  Users, 
  XCircle, 
  Clock, 
  Loader2,
  ChevronRight,
  Search,
  Check,
  X
} from "lucide-react"
import { getTeacherDashboardData } from "@/lib/queries"
import type { Course, User } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [attendanceList, setAttendanceList] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    loadCourses()
  }, [currentUser])

  async function loadCourses() {
    try {
      const data = await getTeacherDashboardData(currentUser!.id)
      setCourses(data.courses)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const students = selectedCourse?.students || []

  const handleMarkAll = (present: boolean) => {
    const newAttendance: Record<string, boolean> = {}
    students.forEach(s => {
      const studentId = typeof s === "string" ? s : s.id
      newAttendance[studentId] = present
    })
    setAttendanceList(newAttendance)
  }

  const toggleAttendance = (studentId: string) => {
    setAttendanceList(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }))
  }

  const handleSubmit = () => {
    if (!selectedCourseId) return
    setSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      toast.success(`Attendance marked for ${selectedCourse?.code}`)
      setIsDialogOpen(false)
      setSubmitting(false)
      setSelectedCourseId(null)
      setAttendanceList({})
    }, 1500)
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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>
                  Select a course and mark students as present or absent.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Select Course</label>
                  <Select value={selectedCourseId || ""} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11">
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCourseId && (
                  <>
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/8">
                       <p className="text-xs font-medium px-2">{students.length} Students Enrolled</p>
                       <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAll(true)} className="h-7 text-[10px] hover:bg-emerald-500/10 text-emerald-400">Mark All Present</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAll(false)} className="h-7 text-[10px] hover:bg-rose-500/10 text-rose-400">Mark All Absent</Button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 py-2">
                       {students.map((s: any) => {
                         const studentId = typeof s === "string" ? s : s.id
                         const isPresent = attendanceList[studentId] ?? false
                         return (
                           <div key={studentId} 
                             className={cn(
                               "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                               isPresent ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/8"
                             )}
                             onClick={() => toggleAttendance(studentId)}
                           >
                             <div className="flex items-center gap-3">
                               <Avatar className="h-8 w-8 border border-white/10">
                                 <AvatarFallback className={cn("text-[10px] font-bold", isPresent ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted-foreground")}>
                                   {s.name?.charAt(0) || "U"}
                                 </AvatarFallback>
                               </Avatar>
                               <div className="min-w-0">
                                 <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                                 <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                               </div>
                             </div>
                             <div className={cn(
                               "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                               isPresent ? "bg-emerald-500 text-white" : "bg-white/10 text-white/20"
                             )}>
                               {isPresent ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                             </div>
                           </div>
                         )
                       })}
                    </div>

                    <Button 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 rounded-xl shadow-lg mt-2"
                      disabled={submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Save Attendance Records
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
           {courses.slice(0, 2).map(course => (
              <div key={course.id} className="glass-card p-5">
                 <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{course.title}</h3>
                      <p className="text-sm text-primary">{course.code}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                       <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-2xl font-bold text-emerald-400">92%</p>
                       <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-2xl font-bold text-foreground">{(course.students || []).length}</p>
                       <p className="text-xs text-muted-foreground">Total Students</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        <div className="glass-card p-5 mt-4">
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                 <Clock className="h-4 w-4 text-primary" /> Recent Roll Calls
              </h2>
           </div>
           <div className="flex flex-col gap-3">
              {courses.slice(0, 3).map((course, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between rounded-xl bg-white/5 border border-white/8 p-4 hover:bg-white/10 transition-colors gap-4 md:gap-0">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-foreground">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(Date.now() - idx * 86400000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-6">
                       <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-emerald-400">{(course.students || []).length - idx}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Present</span>
                       </div>
                       <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-rose-400">{idx}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Absent</span>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="bg-white/5 border border-white/10 hover:bg-white/10 h-9 px-4 rounded-lg">
                      View Details
                    </Button>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
