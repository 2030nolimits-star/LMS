"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Video, File, Presentation, Plus, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getTeacherCourses, uploadMaterial, deleteMaterial } from "@/lib/queries"
import type { Course, Material } from "@/lib/types"
import { courses as mockCourses } from "@/lib/mock-data"
import { useEffect } from "react"

const materialIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  video: Video,
  document: File,
  slide: Presentation,
}

export default function TeacherMaterialsPage() {
  const { currentUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [uploading, setUploading] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    course_id: "",
    title: "",
    type: "pdf" as any,
    file_size: "0 MB"
  })
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)


  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true);
    try {
      const data = await getTeacherCourses(currentUser!.id);
      if (data.length > 0) {
        setCourses(data);
      } else {
        // Fallback for demo
        setCourses(mockCourses.slice(0, 2));
      }
    } catch (e) {
      console.error("Materials load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.course_id || !newMaterial.title) {
      toast.error("Please fill required fields");
      return;
    }
    setUploading(true);
    try {
      await uploadMaterial({
        ...newMaterial
      } as any, selectedFile || undefined);
      toast.success("Material uploaded successfully!");
      setFileName("");
      setSelectedFile(null);
      loadData();
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e.message || "Upload failed. Check if storage buckets 'materials' exist.");
    } finally {
      setUploading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      await deleteMaterial(id);
      toast.success("Material deleted successfully");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete material");
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

  const allMaterials = courses.flatMap((c) =>
    (c.materials || []).map((m) => ({ ...m, courseTitle: c.title, courseCode: c.code }))
  )

  const filtered =
    selectedCourse === "all"
      ? allMaterials
      : allMaterials.filter((m) => m.courseId === selectedCourse)


  return (
    <DashboardShell role="teacher">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Materials</h1>
            <p className="text-muted-foreground">
              Upload and manage course materials for your students.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Material</DialogTitle>
                <DialogDescription>
                  Add new study materials for your students.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleUpload}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>Course</Label>
                  <Select 
                    value={newMaterial.course_id}
                    onValueChange={(val) => setNewMaterial({...newMaterial, course_id: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g. Week 5 - Graphs" 
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select 
                    value={newMaterial.type}
                    onValueChange={(val) => setNewMaterial({...newMaterial, type: val as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Material type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="slide">Slides</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>File</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground text-center">
                      <Upload className="h-8 w-8" />
                      <p className="text-sm font-medium text-foreground">
                        {fileName ? fileName : "Click to select a file from your computer"}
                      </p>
                      <p className="text-xs">Supports PDF, DOC, PPT, MP4 (up to 100MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                          setFileName(file.name)
                          const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
                          setNewMaterial({...newMaterial, file_size: `${sizeMB} MB`})
                        }
                      }}
                    />
                  </label>
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue />
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

        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center py-12">
                <p className="text-sm text-muted-foreground">
                  No materials found. Upload your first material above.
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((mat) => {
              const Icon = materialIcons[mat.type] || File
              return (
                <Card key={mat.id} className="border-border/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {(mat as any).file_url ? (
                          <a href={(mat as any).file_url} target="_blank" rel="noreferrer" className="hover:underline">
                            {mat.title}
                          </a>
                        ) : (
                          mat.title
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mat.courseCode} - {mat.type.toUpperCase()} - {mat.size}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(mat.uploadedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {(mat as any).file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={(mat as any).file_url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDelete(mat.id)}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
