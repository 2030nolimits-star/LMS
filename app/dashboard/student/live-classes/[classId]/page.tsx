"use client"

import { use, useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getLiveClassById } from "@/lib/queries"
import { VideoRoom } from "@/components/live/video-room"
import { Loader2 } from "lucide-react"
import type { LiveClass } from "@/lib/types"

// We use the same demo session definitions from the live classes dashboard so the user
// can click into any of them and see a working demo UI effortlessly.
const demoSessions: Record<string, LiveClass> = {
  "1": { id: "1", title: "Graph Algorithms Deep Dive", courseId: "CS301", courseName: "Data Structures & Algorithms", status: "live", scheduledAt: new Date().toISOString(), duration: 90, teacherId: "demo-t1", meetLink: "" },
  "2": { id: "2", title: "Eigenvectors & Eigenvalues", courseId: "MATH201", courseName: "Linear Algebra", status: "scheduled", scheduledAt: new Date(Date.now() + 86400000).toISOString(), duration: 60, teacherId: "demo-t2", meetLink: "" },
  "3": { id: "3", title: "Neural Network Backprop",    courseId: "CS401", courseName: "Machine Learning", status: "scheduled", scheduledAt: new Date(Date.now() + 172800000).toISOString(), duration: 120, teacherId: "demo-t3", meetLink: "" }
}

export default function StudentLiveClassRoomPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = use(params)
  const { currentUser } = useAuth()
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    // If it's a demo class, resolve immediately
    if (demoSessions[classId]) {
      setLiveClass(demoSessions[classId])
      setIsLoading(false)
      return
    }

    // Otherwise, hit DB
    getLiveClassById(classId)
      .then((data) => setLiveClass(data))
      .finally(() => setIsLoading(false))
  }, [classId, currentUser])

  if (!currentUser) {
    redirect("/login")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!liveClass) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0b] text-foreground p-4 text-center">
        <div className="glass-card p-8 flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
             <span className="text-2xl text-muted-foreground">?</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            Class not found
          </p>
          <p className="text-sm text-muted-foreground">
            This live class session does not exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <VideoRoom
      liveClass={liveClass}
      currentUser={currentUser}
      backUrl="/dashboard/student/live-classes"
    />
  )
}
