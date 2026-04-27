"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  FileIcon,
  ExternalLink,
  Loader2
} from "lucide-react"
import { getAssignmentById, submitAssignment, getStudentSubmissions } from "@/lib/queries"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { courses as mockCourses } from "@/lib/mock-data"


export default function StudentAssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [submissionText, setSubmissionText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const assignmentId = params.assignmentId as string
  const courseId = params.courseId as string

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser, assignmentId])

  async function loadData() {
    setLoading(true);
    try {
      let assignData = await getAssignmentById(assignmentId);
      
      // Fallback to mock data for demo purposes
      if (!assignData) {
        mockCourses.forEach(c => {
          const found = c.assignments.find(a => a.id === assignmentId);
          if (found) {
            assignData = {
              ...found,
              courseName: c.title,
              courseCode: c.code,
              teacherName: c.teacherName
            };
          }
        });
      }

      const submissions = await getStudentSubmissions(currentUser!.id, assignmentId);
      
      setAssignment(assignData);
      if (submissions.length > 0) {
        setSubmission(submissions[0]);
        setSubmissionText(submissions[0].content || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      await submitAssignment({
        assignmentId,
        studentId: currentUser.id,
        content: submissionText,
        fileUrl: selectedFile ? "demo-file-url" : null, // Mock file upload
      });
      toast.success("Assignment submitted successfully!");
      setIsSubmitOpen(false);
      loadData();
    } catch (e) {
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell role="student">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  if (!assignment) {
    return (
      <DashboardShell role="student">
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Assignment Not Found</h2>
          <Button variant="link" onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardShell>
    )
  }

  const isLate = new Date() > new Date(assignment.dueDate)
  const isSubmitted = !!submission

  return (
    <DashboardShell role="student">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main Info */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{assignment.title}</h1>
                <Badge variant={isSubmitted ? "default" : "secondary"}>
                  {isSubmitted ? "Submitted" : "Not Submitted"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Course: <span className="text-foreground font-medium">{assignment.courseName}</span>
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                  {assignment.description}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Assignment Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assignment_brief_v2.pdf</p>
                    <p className="text-xs text-muted-foreground">PDF · 2.4 MB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Status Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className={cn(
                "p-4 flex items-center justify-between",
                isSubmitted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
              )}>
                <span className="text-sm font-bold uppercase tracking-wider">Submission Status</span>
                {isSubmitted ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Due Date</span>
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-2 ml-6">
                      <Clock className="h-3 w-3" />
                      {new Date(assignment.dueDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Time Remaining</span>
                    <span className={cn(
                      "text-sm font-medium",
                      isLate && !isSubmitted ? "text-rose-500" : "text-foreground"
                    )}>
                      {isLate ? (isSubmitted ? "Submitted Late" : "Overdue") : "3 days remaining"}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Grade</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {submission?.grade || "Not Graded"}
                    </span>
                  </div>
                </div>
                <div className="p-4 pt-2">
                  {!isSubmitted ? (
                    <Button className="w-full" onClick={() => setIsSubmitOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Submission
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setIsSubmitOpen(true)}>
                      Edit Submission
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {isSubmitted && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">Submitted Files</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium truncate flex-1">assignment_final.pdf</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-none shadow-2xl rounded-[32px] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-900">Submit Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-semibold text-slate-900">Content / Link</Label>
              <Textarea 
                id="content"
                placeholder="Type your content or paste a link..." 
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="min-h-[140px] bg-white border-[#E2E8F0] rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-slate-700 placeholder:text-slate-400 transition-all text-base p-4"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-900">Attachment</Label>
              <label className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E2E8F0] p-12 transition-all group hover:bg-slate-50/50",
                selectedFile ? "bg-purple-50/50 border-purple-200" : ""
              )}>
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110",
                  selectedFile ? "bg-purple-100 text-purple-600" : "text-slate-400"
                )}>
                  <Upload className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <p className="text-base font-bold text-slate-900">
                  {selectedFile ? selectedFile.name : "Select a file"}
                </p>
                <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 bg-[#E9D5FF] hover:bg-[#D8B4FE] text-purple-900 font-bold text-lg rounded-2xl shadow-sm transition-all border-none" 
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : "Submit Now"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

// Sub-components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
