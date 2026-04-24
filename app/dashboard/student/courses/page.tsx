"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video as VideoIcon, File, Presentation, Clock, Users, Download } from "lucide-react"

const demoCourses = [
  {
    id: "1", code: "CS301", title: "Data Structures & Algorithms", color: "hsl(270,80%,70%)",
    teacherName: "Dr. James Carter", students: 38, credits: 4,
    materials: [
      { id: "m1", title: "Week 1 - Arrays & Linked Lists", type: "pdf", size: "2.4 MB", uploadedAt: "2026-04-01" },
      { id: "m2", title: "Binary Trees Lecture Recording", type: "video", size: "480 MB", uploadedAt: "2026-04-05" },
      { id: "m3", title: "Graph Algorithms Slides",       type: "slide", size: "8.1 MB", uploadedAt: "2026-04-12" },
    ],
    assignments: [
      { id: "a1", title: "Binary Trees Lab",     dueDate: "2026-04-20", maxScore: 100, submitted: true,  score: 94 },
      { id: "a2", title: "Graph Traversal Task", dueDate: "2026-04-28", maxScore: 100, submitted: false, score: null },
    ],
  },
  {
    id: "2", code: "MATH201", title: "Linear Algebra", color: "hsl(168,84%,45%)",
    teacherName: "Prof. Sarah Kim", students: 45, credits: 3,
    materials: [
      { id: "m4", title: "Matrix Fundamentals",        type: "pdf",      size: "1.8 MB", uploadedAt: "2026-04-02" },
      { id: "m5", title: "Eigenvectors Explained",     type: "document", size: "0.9 MB", uploadedAt: "2026-04-10" },
    ],
    assignments: [
      { id: "a3", title: "Matrix Operations",         dueDate: "2026-04-18", maxScore: 100, submitted: true,  score: 88 },
      { id: "a4", title: "Eigenvalue Problem Set",    dueDate: "2026-04-30", maxScore: 50,  submitted: false, score: null },
    ],
  },
  {
    id: "3", code: "CS401", title: "Machine Learning", color: "hsl(200,90%,60%)",
    teacherName: "Dr. Ahmed Hassan", students: 29, credits: 4,
    materials: [
      { id: "m6", title: "Introduction to ML",           type: "slide", size: "5.2 MB", uploadedAt: "2026-03-28" },
      { id: "m7", title: "Linear Regression Notebook",   type: "document", size: "1.1 MB", uploadedAt: "2026-04-08" },
    ],
    assignments: [
      { id: "a5", title: "Regression Analysis",   dueDate: "2026-04-22", maxScore: 100, submitted: true,  score: 76 },
    ],
  },
]

const materialIcons: Record<string, React.ElementType> = {
  pdf: FileText, video: VideoIcon, document: File, slide: Presentation,
}

export default function StudentCoursesPage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">View your enrolled courses, materials, and assignments.</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Enrolled",    value: demoCourses.length,                                      color: "text-primary"    },
            { label: "Total Credits", value: demoCourses.reduce((s, c) => s + c.credits, 0),        color: "text-emerald-400"},
            { label: "Assignments", value: demoCourses.flatMap(c => c.assignments).length,           color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {demoCourses.map((course) => (
            <div key={course.id} className="glass-card p-5 flex flex-col gap-4">
              {/* Course header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: course.color + "25" }}>
                    <BookOpen className="h-5 w-5" style={{ color: course.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span>{course.code}</span>
                      <span>·</span>
                      <span>{course.teacherName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students}</span>
                    </div>
                  </div>
                </div>
                <Badge className="border-none" style={{ backgroundColor: course.color + "25", color: course.color }}>
                  {course.credits} Credits
                </Badge>
              </div>

              <Tabs defaultValue="materials">
                <TabsList className="bg-white/5 border border-white/8 rounded-xl w-full justify-start">
                  <TabsTrigger value="materials" className="rounded-lg">Materials ({course.materials.length})</TabsTrigger>
                  <TabsTrigger value="assignments" className="rounded-lg">Assignments ({course.assignments.length})</TabsTrigger>
                </TabsList>

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

                <TabsContent value="assignments" className="mt-3">
                  <div className="flex flex-col gap-2">
                    {course.assignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{a.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            Due {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                        {a.submitted && a.score !== null ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-none">{a.score}/{a.maxScore}</Badge>
                        ) : a.submitted ? (
                          <Badge className="bg-primary/20 text-primary border-none">Submitted</Badge>
                        ) : (
                          <Button size="sm" className="rounded-lg text-xs">Submit</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
