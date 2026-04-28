"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Clock, Calendar, Users, PlusSquare, Zap, PlayCircle, Loader2, Plus } from "lucide-react"
import { getTeacherLiveClasses, updateLiveClassStatus, getTeacherCourses, scheduleLiveClass } from "@/lib/queries"
import type { LiveClass, Course } from "@/lib/types"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TeacherLiveClassesPage() {
  const { currentUser } = useAuth()
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [scheduling, setScheduling] = useState(false)

  // Form State
  const [newClass, setNewClass] = useState({
    title: "",
    courseId: "",
    date: "",
    time: "",
    duration: "60",
  })

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser])

  async function loadData() {
    try {
      const [classesData, coursesData] = await Promise.all([
        getTeacherLiveClasses(currentUser!.id),
        getTeacherCourses(currentUser!.id)
      ])
      setLiveClasses(classesData)
      setCourses(coursesData)
    } catch (e) {
      console.error(e)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleStartClass = async (classId: string) => {
    try {
      await updateLiveClassStatus(classId, "live")
      toast.success("Class is now live!")
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Failed to start class")
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClass.title || !newClass.courseId || !newClass.date || !newClass.time) {
      toast.error("Please fill in all fields")
      return
    }

    setScheduling(true)
    try {
      const scheduledAt = new Date(`${newClass.date}T${newClass.time}`).toISOString()
      await scheduleLiveClass({
        title: newClass.title,
        courseId: newClass.courseId,
        scheduledAt,
        duration: parseInt(newClass.duration),
        teacherId: currentUser!.id,
        status: "scheduled"
      })
      toast.success("Class scheduled successfully")
      setIsDialogOpen(false)
      setNewClass({ title: "", courseId: "", date: "", time: "", duration: "60" })
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Failed to schedule class")
    } finally {
      setScheduling(false)
    }
  }

  if (!currentUser) return null

  const liveNow = liveClasses.filter(lc => lc.status === "live")
  const upcoming = liveClasses.filter(lc => lc.status === "scheduled")
  const past = liveClasses.filter(lc => lc.status === "ended")

  const renderClass = (lc: LiveClass) => {
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
                   {new Date(lc.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                   <Clock className="h-3 w-3" />
                   {new Date(lc.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
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
            <Button variant="outline" size="sm" className="w-full md:w-auto bg-white/5 border-white/10 hover:bg-white/10">
               View Recording
            </Button>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex-1 md:w-auto bg-white/5 border-white/10 text-foreground hover:bg-white/10">
                 Edit
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleStartClass(lc.id)}
                className="flex-1 md:w-auto bg-primary text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-primary/90"
              >
                 Start Now
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

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
      <div className="relative flex flex-col gap-6 bg-mesh min-h-[calc(100vh-10rem)]">
        <div className="pointer-events-none absolute -top-10 right-20 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Virtual Classes</h1>
            <p className="text-muted-foreground mt-1">Host interactive sessions and manage recordings.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Plus className="mr-2 h-4 w-4" /> Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-foreground/95 text-background border-foreground/10">
              <form onSubmit={handleSchedule}>
                <DialogHeader>
                  <DialogTitle>Schedule Live Class</DialogTitle>
                  <DialogDescription className="text-background/50">
                    Set up a new virtual classroom session for your students.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-background/70">Class Title</Label>
                    <Input
                      id="title"
                      value={newClass.title}
                      onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                      placeholder="e.g. Advanced Calculus Review"
                      className="bg-background/5 border-background/10 text-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-background/70">Course</Label>
                    <Select
                      value={newClass.courseId}
                      onValueChange={(value) => setNewClass({ ...newClass, courseId: value })}
                    >
                      <SelectTrigger className="bg-background/5 border-background/10 text-background">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date" className="text-background/70">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newClass.date}
                        onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                        className="bg-background/5 border-background/10 text-background"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time" className="text-background/70">Start Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newClass.time}
                        onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                        className="bg-background/5 border-background/10 text-background"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration" className="text-background/70">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newClass.duration}
                      onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                      className="bg-background/5 border-background/10 text-background"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={scheduling}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {scheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm Schedule
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {liveClasses.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No live classes scheduled</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Create your first virtual session to start teaching in real-time.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>Create Now</Button>
          </div>
        ) : (
          <>
            {liveNow.length > 0 && (
              <div className="flex flex-col gap-3">
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                   <Zap className="h-4 w-4" /> Live Now
                 </h2>
                 {liveNow.map(renderClass)}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="flex flex-col gap-3">
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mt-4">Upcoming Schedule</h2>
                 {upcoming.map(renderClass)}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-4">Past Sessions</h2>
                 {past.map(renderClass)}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}


