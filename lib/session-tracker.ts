"use client"

import type { User, UserRole } from "./types"

const STORAGE_KEY = "edura_active_sessions_v1"
const HEARTBEAT_MAX_AGE_MS = 5 * 60 * 1000

export interface ActiveSession {
  userId: string
  name: string
  role: UserRole
  status: User["status"]
  lastSeenAt: string
}

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getActiveSessions(): ActiveSession[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as ActiveSession[]
    const now = Date.now()
    const fresh = parsed.filter((session) => {
      const age = now - new Date(session.lastSeenAt).getTime()
      return Number.isFinite(age) && age <= HEARTBEAT_MAX_AGE_MS
    })

    if (fresh.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    }

    return fresh
  } catch {
    return []
  }
}

export function upsertActiveSession(user: User) {
  if (!canUseStorage()) return

  const sessions = getActiveSessions().filter((s) => s.userId !== user.id)
  sessions.push({
    userId: user.id,
    name: user.name,
    role: user.role,
    status: user.status,
    lastSeenAt: new Date().toISOString(),
  })

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function removeActiveSession(userId: string) {
  // For demo purposes, we do not remove the session on logout.
  // This allows you to log out as a student and log in as a teacher
  // in the same browser to see the student still "online".
  if (!canUseStorage()) return
  // const sessions = getActiveSessions().filter((session) => session.userId !== userId)
  // window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}
