"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Plus, FileText, Video as VideoIcon, File, Presentation, Clock, Download } from "lucide-react"

const materialIcons: Record<string, React.ElementType> = {
  pdf: FileText, video: VideoIcon, document: File, slide: Presentation,
}

const demoCoursesData = [
  {
    id: "1", code: "CS301", title: "Data Structures & Algorithms", color: "hsl(270,80%,70%)",
    semester: "Spring 2026", credits: 4,
    students: [
      { id: "s1", name: "Trushi Kirankumar Patel", email: "trushi@student.com" },
      { id: "s2", name: "Alex Johnson", email: "alex@student.com" },
      { id: "s3", name: "Maria Garcia", email: "maria@student.com" },
    ],
    materials: [
      { id: "m1", title: "Week 1 - Arrays & Linked Lists", type: "pdf", size: "2.4 MB", uploadedAt: "2026-04-01" },
      { id: "m2", title: "Binary Trees Lecture Recording", type: "video", size: "480 MB", uploadedAt: "2026-04-05" },
    ],
    assignments: [
      { id: "a1", title: "Binary Trees Lab", dueDate: "2026-04-20", maxScore: 100, submissions: 38, graded: 26 },
      { id: "a2", title: "Graph Traversal Task", dueDate: "2026-04-28", maxScore: 100, submissions: 5, graded: 0 },
    ],
  },
  {
    id: "2", code: "MATH201", title: "Linear Algebra", color: "hsl(168,84%,45%)",
    semester: "Spring 2026", credits: 3,
    students: [
      { id: "s1", name: "Trushi Kirankumar Patel", email: "trushi@student.com" },
      { id: "s4", name: "Daniel Smith", email: "daniel@student.com" },
    ],
    materials: [
      { id: "m4", title: "Matrix Fundamentals", type: "pdf", size: "1.8 MB", uploadedAt: "2026-04-02" },
    ],
    assignments: [
      { id: "a3", title: "Matrix Operations", dueDate: "2026-04-18", maxScore: 100, submissions: 45, graded: 45 },
    ],
  },
]

export default function TeacherCoursesPage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-1">Manage your courses, students, and curriculum.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>

        {demoCoursesData.map((course) => {
          const totalPending = course.assignments.reduce((sum, a) => sum + (a.submissions - a.graded), 0)
          
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
                  {totalPending > 0 && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-none">
                      {totalPending} to grade
                    </Badge>
                  )}
                  <Badge className="bg-white/10 text-foreground border-white/20">
                    <Users className="mr-1 h-3 w-3" /> {course.students.length} Enrolled
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="assignments">
                <TabsList className="bg-white/5 border border-white/8 rounded-xl w-full justify-start">
                  <TabsTrigger value="assignments" className="rounded-lg">Assignments ({course.assignments.length})</TabsTrigger>
                  <TabsTrigger value="materials" className="rounded-lg">Materials ({course.materials.length})</TabsTrigger>
                  <TabsTrigger value="students" className="rounded-lg">Roster ({course.students.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="mt-3">
                   <div className="flex flex-col gap-2">
                      {course.assignments.map(a => (
                        <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                           <div>
                              <p className="text-sm font-medium text-foreground">{a.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Due {new Date(a.dueDate).toLocaleDateString()} · {a.maxScore} Max Pts
                              </p>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">{a.graded}/{a.submissions} Graded</span>
                              <Badge className={a.graded === a.submissions ? "bg-emerald-500/20 text-emerald-400 border-none" : "bg-amber-500/20 text-amber-400 border-none"}>
                                 {a.submissions} Submitted
                              </Badge>
                              <Button size="sm" variant="outline" className="h-8 rounded-lg">View</Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </TabsContent>

                <TabsContent value="materials" className="mt-3">
                   <div className="flex flex-col gap-2">
                     {course.materials.map((mat) => {
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
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10">
                             <Download className="h-4 w-4" />
                           </Button>
                         </div>
                       )
                     })}
                   </div>
                </TabsContent>

                <TabsContent value="students" className="mt-3">
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {course.students.map(s => (
                         <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3">
                           <Avatar className="h-9 w-9 border border-white/10 rounded-lg">
                             <AvatarFallback className="bg-primary/20 text-primary rounded-lg font-bold">{s.name.charAt(0)}</AvatarFallback>
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
