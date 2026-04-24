"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { getTeacherCourses, getPendingSubmissions, submitGrade } from "@/lib/queries"
import { useEffect } from "react"
import type { Course } from "@/lib/types"
import { courses as mockCourses, mockSubmissions } from "@/lib/mock-data"

export default function TeacherGradingPage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [score, setScore] = useState<number>(0)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true);
    try {
      const [cData, sData] = await Promise.all([
        getTeacherCourses(currentUser!.id),
        getPendingSubmissions(currentUser!.id)
      ]);
      
      if (cData.length > 0 || sData.length > 0) {
        setCourses(cData);
        setSubmissions(sData);
      } else {
        // Fallback for demo
        setCourses(mockCourses.slice(0, 2));
        setSubmissions(mockSubmissions);
      }
    } catch (e) {
      console.error("Grading load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingId) return;
    try {
      await submitGrade(gradingId, score, feedback);
      toast.success("Grade submitted successfully!");
      setGradingId(null);
      loadData();
    } catch (e) {
      toast.error("Failed to submit grade");
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

  const filtered = selectedCourse === "all" 
    ? submissions 
    : submissions.filter(s => s.assignment?.course_id === selectedCourse);

  return (
    <DashboardShell role="teacher">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grading</h1>
          <p className="text-muted-foreground">
            Grade student submissions and provide feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length > 0 ? (
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Pending Submissions
                </CardTitle>
                <Badge variant="secondary">
                  {filtered.length} Awaiting Review
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course & Assignment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{sub.studentName}</span>
                          <span className="text-xs text-muted-foreground">{sub.studentReg}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{sub.assignmentTitle}</span>
                          <span className="text-xs text-muted-foreground">{sub.courseTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={gradingId === sub.id} onOpenChange={(open) => {
                          if (open) {
                            setGradingId(sub.id);
                            setScore(sub.grade || 0);
                            setFeedback(sub.feedback || "");
                          } else {
                            setGradingId(null)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Review & Grade
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Grading: {sub.studentName}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Score (Max {sub.maxScore})</Label>
                                <Input 
                                  type="number" 
                                  max={sub.maxScore} 
                                  value={score} 
                                  onChange={(e) => setScore(Number(e.target.value))}
                                  required 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Feedback</Label>
                                <Textarea 
                                  value={feedback} 
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Well done on the implementation..." 
                                  rows={4} 
                                />
                              </div>
                              <Button type="submit" className="w-full">Submit Grade</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        ) : (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center py-12">
              <CheckCircle2 className="mb-2 h-10 w-10 text-success" />
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">
                No pending submissions for this selection.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
