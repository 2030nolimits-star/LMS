"use client"

import { use, useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getLiveClassById } from "@/lib/queries"
import { VideoRoom } from "@/components/live/video-room"
import { Loader2 } from "lucide-react"
import type { LiveClass } from "@/lib/types"

const demoSessions: Record<string, LiveClass> = {
  lc1: {
    id: "lc1",
    title: "Graph Algorithms Deep Dive",
    courseId: "CS301",
    courseName: "Data Structures & Algorithms",
    status: "live",
    scheduledAt: new Date().toISOString(),
    duration: 90,
    teacherId: "demo-t1",
    teacherName: "Dr. James Carter",
    attendees: [],
  },
  lc2: {
    id: "lc2",
    title: "Linear Transformations",
    courseId: "MATH201",
    courseName: "Linear Algebra",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    duration: 60,
    teacherId: "demo-t2",
    teacherName: "Prof. Sarah Kim",
    attendees: [],
  },
  lc5: {
    id: "lc5",
    title: "Intro to Trees",
    courseId: "CS301",
    courseName: "Data Structures & Algorithms",
    status: "ended",
    scheduledAt: new Date(Date.now() - 400000000).toISOString(),
    duration: 75,
    teacherId: "demo-t1",
    teacherName: "Dr. James Carter",
    attendees: [],
  },
}

export default function TeacherLiveClassRoomPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = use(params)
  const { currentUser } = useAuth()
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    if (demoSessions[classId]) {
      setLiveClass(demoSessions[classId])
      setLoading(false)
      return
    }

    getLiveClassById(classId)
      .then((data) => {
        setLiveClass(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [classId, currentUser])

  if (!currentUser) {
    redirect("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }


  if (!liveClass) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-foreground/95">
        <div className="text-center">
          <p className="text-lg font-semibold text-background">
            Class not found
          </p>
          <p className="text-sm text-background/50">
            This live class session does not exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <VideoRoom
      liveClass={liveClass}
      currentUser={currentUser}
      backUrl="/dashboard/teacher/live-classes"
    />
  )
}
