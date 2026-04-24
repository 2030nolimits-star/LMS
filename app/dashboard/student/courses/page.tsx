"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  FileText, 
  Video as VideoIcon, 
  File, 
  Presentation, 
  Clock, 
  Download, 
  Loader2, 
  Upload, 
  CheckCircle2 
} from "lucide-react"
import { getStudentCourses, sendMessage } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import type { Course } from "@/lib/types"
import { courses as mockCourses } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const materialIcons: Record<string, React.ElementType> = {
  pdf: FileText, video: VideoIcon, document: File, slide: Presentation,
}

export default function StudentCoursesPage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<any[]>([])
  
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getStudentCourses(currentUser!.id)
      
      if (data.length > 0) {
        setCourses(data)
      } else {
        // Fallback for demo: show premium mock data if DB is empty
        setCourses(mockCourses.slice(0, 3))
      }
      
      // Fetch user's submissions
      const { data: subData } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", currentUser!.id);
      setSubmissions(subData || []);
      
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !currentUser) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .insert([{
          assignment_id: selectedAssignment.id,
          student_id: currentUser.id,
          content: submissionText,
          status: "submitted",
          submitted_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      toast.success("Assignment submitted successfully!");
      setIsSubmitOpen(false);
      setSubmissionText("");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  }

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
            { label: "Enrolled",    value: courses.length,                                      color: "text-primary"    },
            { label: "Total Credits", value: courses.reduce((s, c) => s + (c.credits || 3), 0),        color: "text-emerald-400"},
            { label: "Assignments", value: courses.flatMap(c => c.assignments || []).length,           color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="glass-card flex flex-col items-center py-16 px-4 text-center">
             <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
             <h3 className="text-xl font-bold text-foreground">No Courses</h3>
             <p className="text-muted-foreground mt-2 max-w-md">You are not enrolled in any courses yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {courses.map((course) => {
            const materials = course.materials || []
            const assignments = course.assignments || []

            return (
              <div key={course.id} className="glass-card p-5 flex flex-col gap-4">
                {/* Course header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: (course.color || "#ccc") + "25" }}>
                      <BookOpen className="h-5 w-5" style={{ color: course.color || "#ccc" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span>{course.code}</span>
                        <span>·</span>
                        <span>{course.teacherName}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="border-none" style={{ backgroundColor: (course.color || "#ccc") + "25", color: course.color || "#ccc" }}>
                    {course.credits || 3} Credits
                  </Badge>
                </div>

                <Tabs defaultValue="materials">
                  <TabsList className="bg-white/5 border border-white/8 rounded-xl w-full justify-start">
                    <TabsTrigger value="materials" className="rounded-lg">Materials ({materials.length})</TabsTrigger>
                    <TabsTrigger value="assignments" className="rounded-lg">Assignments ({assignments.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="materials" className="mt-3">
                    <div className="flex flex-col gap-2">
                      {materials.length === 0 && <p className="text-sm text-muted-foreground p-2">No materials available.</p>}
                      {materials.map((mat) => {
                        const Icon = materialIcons[mat.type] || File
                        return (
                          <div key={mat.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{mat.title}</p>
                              <p className="text-xs text-muted-foreground">{mat.type.toUpperCase()} · {mat.size || "Unknown size"}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(mat.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            {(mat as any).file_url && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10 shrink-0" asChild>
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
                      {assignments.length === 0 && <p className="text-sm text-muted-foreground p-2">No assignments available.</p>}
                      {assignments.map((a: any) => {
                         const sub = submissions.find(s => s.assignment_id === a.id);
                         const isGraded = sub?.status === "graded";

                         return (
                           <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 p-3 hover:bg-white/8 transition-colors">
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                               <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                 <span className="flex items-center gap-1">
                                   <Clock className="h-3 w-3" />
                                   Due {new Date(a.dueDate || a.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                 </span>
                                 <span>·</span>
                                 <span>Max {a.maxScore || a.max_score} pts</span>
                               </div>
                             </div>
                             
                             {isGraded ? (
                               <Badge className="bg-emerald-500/20 text-emerald-400 border-none shrink-0">
                                 {sub.grade}/{a.maxScore || a.max_score}
                               </Badge>
                             ) : sub ? (
                               <Badge className="bg-primary/20 text-primary border-none shrink-0">
                                 Submitted
                               </Badge>
                             ) : (
                               <Dialog open={isSubmitOpen && selectedAssignment?.id === a.id} onOpenChange={(open) => {
                                 setIsSubmitOpen(open);
                                 if (open) setSelectedAssignment(a);
                               }}>
                                 <DialogTrigger asChild>
                                   <Button size="sm" className="rounded-lg text-xs h-8">Submit</Button>
                                 </DialogTrigger>
                                 <DialogContent>
                                   <DialogHeader>
                                     <DialogTitle>Submit Assignment</DialogTitle>
                                     <DialogDescription>
                                       {a.title} - Max {a.maxScore || a.max_score} points
                                     </DialogDescription>
                                   </DialogHeader>
                                   <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
                                     <div className="space-y-2">
                                       <Label>Submission Content / Link</Label>
                                       <Textarea 
                                         placeholder="Paste your assignment link or content here..." 
                                         className="min-h-[150px]"
                                         value={submissionText}
                                         onChange={(e) => setSubmissionText(e.target.value)}
                                         required
                                       />
                                     </div>
                                     <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5">
                                       <Upload className="h-4 w-4" />
                                       Note: File uploads are coming soon. Please provide a link for now.
                                     </div>
                                     <Button type="submit" className="w-full" disabled={submitting}>
                                       {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                       Submit Assignment
                                     </Button>
                                   </form>
                                 </DialogContent>
                               </Dialog>
                             )}
                           </div>
                         )
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
