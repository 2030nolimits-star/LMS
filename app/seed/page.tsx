"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function SeedPage() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSeed = async () => {
    if (!currentUser) {
      toast.error("Please log in as a teacher first.")
      return
    }

    setLoading(true)
    try {
      // 1. Create a course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert([{
          title: "Advanced Data Structures",
          code: "CS401",
          description: "A deep dive into trees, graphs, and dynamic programming.",
          teacher_id: currentUser.id,
          color: "hsl(270,80%,70%)",
          semester: "Spring 2026",
          credits: 4
        }])
        .select()
        .single()

      if (courseError) throw courseError

      // 2. Create some dummy students if they don't exist
      // Since we can't easily bypass Auth to create real users, we will just insert into profiles
      // assuming RLS allows or we just use existing students.
      // Wait, let's fetch any existing students and enroll them.
      const { data: students } = await supabase.from("profiles").select("*").eq("role", "student").limit(5)
      
      if (students && students.length > 0) {
        const enrollments = students.map(s => ({
          student_id: s.id,
          course_id: course.id
        }))
        await supabase.from("enrollments").insert(enrollments)
      }

      // 3. Create an assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from("assignments")
        .insert([{
          course_id: course.id,
          title: "Graph Traversal Implementation",
          description: "Implement BFS and DFS in Python.",
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_score: 100
        }])
        .select()
        .single()
        
      if (assignmentError) throw assignmentError

      // 4. Create submissions for the assignment
      if (students && students.length > 0) {
        const submissions = students.map(s => ({
          student_id: s.id,
          assignment_id: assignment.id,
          status: "submitted",
          submitted_at: new Date().toISOString()
        }))
        await supabase.from("submissions").insert(submissions)
      }

      toast.success("Database seeded successfully with dummy data!")
    } catch (e: any) {
      console.error(e)
      toast.error(`Error seeding database: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="glass-card p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Seed Database</h1>
        <p className="text-muted-foreground mb-6">
          Click below to inject dummy courses, assignments, and enrollments into your live database for testing.
        </p>
        <Button onClick={handleSeed} disabled={loading} className="w-full">
          {loading ? "Seeding..." : "Inject Dummy Data"}
        </Button>
      </div>
    </div>
  )
}
