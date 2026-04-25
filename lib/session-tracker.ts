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
let trackedUser: User | null = null;

export function getActiveSessions(): ActiveSession[] {
  return activeSessionsCache
}

export function upsertActiveSession(user: User) {
  if (typeof window === "undefined") return
  
  trackedUser = user;

  if (!presenceChannel) {
    presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const sessions: ActiveSession[] = []
        for (const id in state) {
          state[id].forEach((presence: any) => {
            sessions.push({
              userId: presence.userId || id,
              name: presence.name || "Unknown",
              role: presence.role || "student",
              status: presence.status || "active",
              lastSeenAt: presence.lastSeenAt || new Date().toISOString()
            })
          })
        }
        
        // Remove duplicates just in case
        const unique = Array.from(new Map(sessions.map(s => [s.userId, s])).values());
        activeSessionsCache = unique;
        
        // Dispatch event so UI can update immediately
        window.dispatchEvent(new CustomEvent('edura-sessions-updated'));
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED' && trackedUser) {
          await presenceChannel.track({
            userId: trackedUser.id,
            name: trackedUser.name,
            role: trackedUser.role,
            status: trackedUser.status,
            lastSeenAt: new Date().toISOString()
          })
        }
      })
  } else {
    // If already initialized and connected, update track
    if (presenceChannel.state === 'joined' && trackedUser) {
      presenceChannel.track({
        userId: trackedUser.id,
        name: trackedUser.name,
        role: trackedUser.role,
        status: trackedUser.status,
        lastSeenAt: new Date().toISOString()
      }).catch(() => {})
    }
  }
}

export function removeActiveSession(userId: string) {
  if (presenceChannel) {
    presenceChannel.untrack()
  }
}
