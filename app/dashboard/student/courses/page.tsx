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
import { getStudentCourses, sendMessage, submitAssignmentWithFile, getAllCourses, enrollInCourse } from "@/lib/queries"
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
import { Search, PlusCircle } from "lucide-react"

const materialIcons: Record<string, React.ElementType> = {
  pdf: FileText, video: VideoIcon, document: File, slide: Presentation,
}

export default function StudentCoursesPage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [allAvailableCourses, setAllAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<any[]>([])
  
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true)
    try {
      const [enrolled, all] = await Promise.all([
        getStudentCourses(currentUser!.id),
        getAllCourses()
      ])
      
      setCourses(enrolled.length > 0 ? enrolled : mockCourses.slice(0, 3))
      setAllAvailableCourses(all.length > 0 ? all : mockCourses)
      
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

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) return;
    setEnrolling(courseId);
    try {
      await enrollInCourse(currentUser.id, courseId);
      toast.success("Enrolled successfully!");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to enroll. You might already be enrolled.");
    } finally {
      setEnrolling(null);
    }
  }

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !currentUser) return;
    
    setSubmitting(true);
    try {
      await submitAssignmentWithFile({
        assignment_id: selectedAssignment.id,
        student_id: currentUser.id,
        content: submissionText,
        status: "submitted",
        submitted_at: new Date().toISOString()
      }, selectedFile || undefined);
        
      toast.success("Assignment submitted successfully!");
      setIsSubmitOpen(false);
      setSubmissionText("");
      setSelectedFile(null);
      loadData();
    } catch (e: any) {
      console.error("Submission error:", e);
      toast.error(e.message || "Failed to submit assignment. Check storage bucket 'submissions'.");
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

  const enrolledIds = new Set(courses.map(c => c.id));
  const otherCourses = allAvailableCourses.filter(c => !enrolledIds.has(c.id));

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Course Catalog</h1>
            <p className="text-muted-foreground mt-1">Manage your enrollments and access learning resources.</p>
          </div>
        </div>

        <Tabs defaultValue="my-courses">
          <TabsList className="bg-white/5 border border-white/8 rounded-xl p-1 mb-4">
            <TabsTrigger value="my-courses" className="rounded-lg px-6">My Enrolled Courses</TabsTrigger>
            <TabsTrigger value="browse" className="rounded-lg px-6">Browse Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="my-courses" className="space-y-6">
            {courses.length === 0 ? (
              <div className="glass-card flex flex-col items-center py-16 px-4 text-center">
                 <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                 <h3 className="text-xl font-bold text-foreground">No Enrolled Courses</h3>
                 <p className="text-muted-foreground mt-2 max-w-md">Browse the catalog to find and enroll in courses.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
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
                              <span className="font-mono text-xs">{course.code}</span>
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
                                         Due {new Date(a.dueDate || a.due_date).toLocaleDateString()}
                                       </span>
                                       <span>·</span>
                                       <span>{a.maxScore || a.max_score} pts</span>
                                     </div>
                                   </div>
                                   
                                   {isGraded ? (
                                     <Badge className="bg-emerald-500/20 text-emerald-400 border-none shrink-0">
                                       {sub.grade}/{a.maxScore || a.max_score}
                                     </Badge>
                                   ) : sub ? (
                                     <Badge className="bg-primary/20 text-primary border-none shrink-0">Submitted</Badge>
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
                                         </DialogHeader>
                                         <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
                                           <div className="space-y-2">
                                             <Label>Content / Link</Label>
                                             <Textarea 
                                               placeholder="Type your content or paste a link..." 
                                               value={submissionText}
                                               onChange={(e) => setSubmissionText(e.target.value)}
                                               required
                                             />
                                           </div>
                                           <div className="space-y-2">
                                             <Label>Attachment</Label>
                                             <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 p-6 hover:bg-white/5 transition-colors">
                                               <Upload className="h-6 w-6 text-muted-foreground" />
                                               <p className="text-sm mt-2 font-medium">{selectedFile ? selectedFile.name : "Select a file"}</p>
                                               <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                             </label>
                                           </div>
                                           <Button type="submit" className="w-full" disabled={submitting}>
                                             {submitting ? "Submitting..." : "Submit Now"}
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
            )}
          </TabsContent>

          <TabsContent value="browse">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherCourses.length === 0 && <p className="text-sm text-muted-foreground p-4 col-span-full">You are enrolled in all available courses.</p>}
                {otherCourses.map(course => (
                  <div key={course.id} className="glass-card p-5 flex flex-col justify-between gap-4 border-white/10">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg mb-3" style={{ backgroundColor: (course.color || "#ccc") + "20" }}>
                        <BookOpen className="h-5 w-5" style={{ color: course.color }} />
                      </div>
                      <h3 className="font-bold text-foreground">{course.title}</h3>
                      <p className="text-xs text-primary font-mono mt-1">{course.code}</p>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{course.description || "No description available."}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-xs text-muted-foreground">Instructor:</span>
                        <span className="text-xs font-medium text-foreground">{course.teacherName}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all group"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                    >
                      {enrolling === course.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />}
                      Enroll Now
                    </Button>
                  </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
