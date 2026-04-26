"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Clock, Calendar, Users, Zap, PlayCircle, Loader2, Plus } from "lucide-react"
import { getTeacherLiveClasses, scheduleLiveClass, getTeacherCourses, updateLiveClassStatus } from "@/lib/queries"
import type { LiveClass, Course } from "@/lib/types"
import { courses as mockCourses } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function TeacherLiveClassesPage() {
  const { currentUser } = useAuth()
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [newClass, setNewClass] = useState({
    title: "",
    courseId: "",
    scheduledAt: "",
    duration: 60,
  })

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true)
    try {
      const [lcData, cData] = await Promise.all([
        getTeacherLiveClasses(currentUser!.id),
        getTeacherCourses(currentUser!.id)
      ])
      
      if (cData.length > 0) {
        setClasses(lcData)
        setCourses(cData)
      } else {
        // Fallback for demo
        setCourses(mockCourses.slice(0, 2))
        setClasses([])
      }
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClass.title || !newClass.courseId || !newClass.scheduledAt) {
      toast.error("Please fill all required fields")
      return
    }
    setScheduling(true)
    try {
      const course = courses.find(c => c.id === newClass.courseId)
      await scheduleLiveClass({
        ...newClass,
        course_id: newClass.courseId,
        courseName: course?.title,
        teacherId: currentUser!.id,
        teacherName: currentUser!.name,
        status: "scheduled",
        attendees: []
      } as any)
      toast.success("Live class scheduled!")
      setIsDialogOpen(false)
      setNewClass({ title: "", courseId: "", scheduledAt: "", duration: 60 })
      loadData()
    } catch(e) {
      toast.error("Failed to schedule class")
    } finally {
      setScheduling(false)
    }
  }

  const handleStartClass = async (classId: string) => {
    try {
      await updateLiveClassStatus(classId, "live");
      toast.success("Class is now live!");
      loadData();
      // We don't redirect here, let the Start button's Link handle it
    } catch(e) {
      toast.error("Failed to start class");
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

  const liveNow = classes.filter(lc => lc.status === "live")
  const upcoming = classes.filter(lc => lc.status === "scheduled")
  const past = classes.filter(lc => lc.status === "ended")

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
                   {new Date(lc.scheduledAt || lc.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                   <Clock className="h-3 w-3" />
                   {new Date(lc.scheduledAt || lc.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                   <span className="opacity-50">({lc.duration}m)</span>
                </span>
                {(isLive || isEnded) && (
                   <span className="flex items-center gap-1 text-emerald-400">
                     <Users className="h-3 w-3" /> {lc.attendees?.length || 0} Attendees
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 md:w-auto bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                  asChild
                >
                  <Link href={`/dashboard/teacher/live-classes/${lc.id}`}>Edit</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 md:w-auto bg-primary text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-primary/90"
                  onClick={() => handleStartClass(lc.id)}
                  asChild
                >
                  <Link href={`/dashboard/teacher/live-classes/${lc.id}`}>Start Now</Link>
                </Button>
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Live Class</DialogTitle>
                <DialogDescription>
                  Set up a new virtual classroom session.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSchedule} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Topic/Title</Label>
                  <Input required placeholder="e.g. Graph Algorithms Deep Dive" value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Course</Label>
                  <Select value={newClass.courseId} onValueChange={v => setNewClass({...newClass, courseId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Date & Time</Label>
                    <Input required type="datetime-local" value={newClass.scheduledAt} onChange={e => setNewClass({...newClass, scheduledAt: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Duration (min)</Label>
                    <Input required type="number" min="15" step="15" value={newClass.duration} onChange={e => setNewClass({...newClass, duration: parseInt(e.target.value)})} />
                  </div>
                </div>
                <Button type="submit" disabled={scheduling}>
                  {scheduling ? "Scheduling..." : "Schedule Class"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {liveNow.length === 0 && upcoming.length === 0 && past.length === 0 && (
          <div className="glass-card flex flex-col items-center py-16 px-4 text-center mt-4">
             <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
             <h3 className="text-xl font-bold text-foreground">No Classes Scheduled</h3>
             <p className="text-muted-foreground mt-2 max-w-md">You haven't scheduled any live classes yet. Click "Schedule Class" above to get started.</p>
          </div>
        )}

        {liveNow.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
               <Zap className="h-4 w-4" /> Live Now
             </h2>
             {liveNow.map(renderClass)}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">Upcoming Schedule</h2>
             {upcoming.map(renderClass)}
          </div>
        )}

        {past.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Past Sessions</h2>
             {past.map(renderClass)}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
