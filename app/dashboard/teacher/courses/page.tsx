"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Plus, FileText, Video as VideoIcon, File, Presentation, Clock, Download, Loader2 } from "lucide-react"
import { getTeacherDashboardData, createCourse } from "@/lib/queries"
import type { Course } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const materialIcons: Record<string, React.ElementType> = {
  pdf: FileText, video: VideoIcon, document: File, slide: Presentation,
}

export default function TeacherCoursesPage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    description: "",
    semester: "Fall 2026",
    credits: 3,
    color: "hsl(270,80%,70%)"
  })

  useEffect(() => {
    if (!currentUser) return;
    loadCourses();
  }, [currentUser])

  async function loadCourses() {
    try {
      const data = await getTeacherDashboardData(currentUser!.id);
      setCourses(data.courses);
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.code) {
      toast.error("Please fill all required fields");
      return;
    }
    setCreating(true)
    try {
      await createCourse({
        ...newCourse,
        teacherId: currentUser!.id,
        teacherName: currentUser!.name
      })
      toast.success("Course created successfully!")
      setIsDialogOpen(false)
      setNewCourse({
        title: "",
        code: "",
        description: "",
        semester: "Fall 2026",
        credits: 3,
        color: "hsl(270,80%,70%)"
      })
      loadCourses()
    } catch(e) {
      toast.error("Failed to create course")
    } finally {
      setCreating(false)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-1">Manage your courses, students, and curriculum.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Set up a new course for students to enroll in.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Course Title</Label>
                  <Input required placeholder="e.g. Introduction to Computer Science" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Course Code</Label>
                    <Input required placeholder="e.g. CS101" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Credits</Label>
                    <Input required type="number" min="1" max="6" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Course description..." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </div>

        {courses.length === 0 ? (
          <div className="glass-card flex flex-col items-center py-16 px-4 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground">No Courses Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md">You haven't created any courses. Click the "New Course" button above to get started.</p>
          </div>
        ) : courses.map((course) => {
          const assignments = course.assignments || []
          const materials = course.materials || []
          const students = course.students || []
          
          return (
            <div key={course.id} className="glass-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: course.color + "25" }}>
                    <BookOpen className="h-5 w-5" style={{ color: course.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {course.code} · {course.semester} · {course.credits} Credits
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-white/10 text-foreground border-white/20">
                    <Users className="mr-1 h-3 w-3" /> {students.length} Enrolled
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="materials">
                <TabsList className="bg-white/5 border border-white/8 rounded-xl w-full justify-start">
                  <TabsTrigger value="materials" className="rounded-lg">Materials ({materials.length})</TabsTrigger>
                  <TabsTrigger value="assignments" className="rounded-lg">Assignments ({assignments.length})</TabsTrigger>
                  <TabsTrigger value="students" className="rounded-lg">Roster ({students.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="materials" className="mt-3">
                   <div className="flex flex-col gap-2">
                     {materials.length === 0 && <p className="text-sm text-muted-foreground p-2">No materials uploaded yet.</p>}
                     {materials.map((mat) => {
                       const Icon = materialIcons[mat.type] || File
                       return (
                         <div key={mat.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                             <Icon className="h-4 w-4 text-primary" />
                           </div>
                           <div className="flex-1">
                             <p className="text-sm font-medium text-foreground">{mat.title}</p>
                             <p className="text-xs text-muted-foreground">{mat.type.toUpperCase()} · {mat.size}</p>
                           </div>
                           <span className="text-xs text-muted-foreground">
                             {new Date(mat.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                           </span>
                           {(mat as any).file_url && (
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" asChild>
                               <a href={(mat as any).file_url} target="_blank" rel="noreferrer">
                                 <Download className="h-4 w-4" />
                               </a>
                             </Button>
                           )}
                         </div>
                       )
                     })}
                   </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-3">
                   <div className="flex flex-col gap-2">
                      {assignments.length === 0 && <p className="text-sm text-muted-foreground p-2">No assignments created yet.</p>}
                      {assignments.map(a => (
                        <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                           <div>
                              <p className="text-sm font-medium text-foreground">{a.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Due {new Date(a.dueDate).toLocaleDateString()} · {a.maxScore} Max Pts
                              </p>
                           </div>
                        </div>
                      ))}
                   </div>
                </TabsContent>

                <TabsContent value="students" className="mt-3">
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {students.length === 0 && <p className="text-sm text-muted-foreground p-2 col-span-full">No students enrolled yet.</p>}
                      {students.map((s: any) => (
                         <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3">
                           <Avatar className="h-9 w-9 border border-white/10 rounded-lg">
                             <AvatarFallback className="bg-primary/20 text-primary rounded-lg font-bold">{s.name?.charAt(0) || "U"}</AvatarFallback>
                           </Avatar>
                           <div className="min-w-0 flex-1">
                             <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                             <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                           </div>
                         </div>
                      ))}
                   </div>
                </TabsContent>
              </Tabs>
            </div>
          )
        })}
      </div>
    </DashboardShell>
  )
}
