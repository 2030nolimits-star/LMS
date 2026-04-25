"use client"

import type { User, UserRole } from "./types"
import { supabase } from "./supabase"

export interface ActiveSession {
  userId: string
  name: string
  role: UserRole
  status: User["status"]
  lastSeenAt: string
}

let activeSessionsCache: ActiveSession[] = []
let presenceChannel: any = null

export function getActiveSessions(): ActiveSession[] {
  return activeSessionsCache
}

export function upsertActiveSession(user: User) {
  if (typeof window === "undefined") return

  if (!presenceChannel) {
    presenceChannel = supabase.channel('online-users')
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const sessions: ActiveSession[] = []
        for (const id in state) {
          state[id].forEach((presence: any) => {
            sessions.push({
              userId: presence.userId,
              name: presence.name,
              role: presence.role,
              status: presence.status,
              lastSeenAt: presence.lastSeenAt
            })
          })
        }
        activeSessionsCache = sessions
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId: user.id,
            name: user.name,
            role: user.role,
            status: user.status,
            lastSeenAt: new Date().toISOString()
          })
        }
      })
  } else {
    // If already initialized, just update track
    try {
      presenceChannel.track({
        userId: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
        lastSeenAt: new Date().toISOString()
      })
    } catch (e) {
      // Ignore errors if not connected
    }
  }
}

export function removeActiveSession(userId: string) {
  if (presenceChannel) {
    presenceChannel.untrack()
    presenceChannel.unsubscribe()
    presenceChannel = null
  }
}
