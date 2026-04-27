"use client"

import { use, useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getLiveClassById } from "@/lib/queries"
import { VideoRoom } from "@/components/live/video-room"
import { Loader2 } from "lucide-react"
import type { LiveClass } from "@/lib/types"

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
