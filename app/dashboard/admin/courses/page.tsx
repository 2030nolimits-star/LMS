"use client"

import { getAdminDashboardData, createCourse, deleteCourse, getAllUsers } from "@/lib/queries"
import { useEffect, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Users, FileText, ClipboardCheck } from "lucide-react"

export default function AdminCoursesPage() {
  const [data, setData] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    teacherId: "",
    credits: 3,
    color: "#6366f1"
  })

  useEffect(() => {
    loadData();
  }, [])

  async function loadData() {
    setLoading(true);
    try {
      const [res, users] = await Promise.all([
        getAdminDashboardData(),
        getAllUsers()
      ]);
      setData(res);
      setTeachers(users.filter(u => u.role === 'teacher'));
    } catch (e) {
      console.error("Courses load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        code: newCourse.code,
        title: newCourse.title,
        teacher_id: newCourse.teacherId, // Map to DB snake_case
        credits: newCourse.credits,
        color: newCourse.color
      };
      await createCourse(payload as any);
      toast.success("Course created successfully!");
      loadData();
    } catch (e) {
      toast.error("Failed to create course");
    } finally {
      setCreating(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all course materials and sessions.")) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted");
      loadData();
    } catch (e) {
      toast.error("Bridge failure: Could not delete course");
    }
  }

  if (loading) {
    return (
      <DashboardShell role="admin">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  const courses = data.coursesRaw || []

  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Overview and management of all courses in the system.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Curriculum Module</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input placeholder="CS101" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input type="number" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Introduction to AI" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Teacher</Label>
                  <Select value={newCourse.teacherId} onValueChange={val => setNewCourse({...newCourse, teacherId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {courses.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {data.students}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Students
                </p>
              </div>
            </CardContent>
          </Card>
          {/* ... Other stats as placeholders or relevant data ... */}
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: (course.color || "#6366f1") + "20",
                            }}
                          >
                            <BookOpen
                              className="h-4 w-4"
                              style={{ color: course.color || "#6366f1" }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.code} - {course.credits} credits
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.teacherName || "Assigned"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {course.enrollments?.[0]?.count || 0} enrolled
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {course.semester || "Semester 1"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

