"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SidebarNav } from "./sidebar-nav"
import { DashboardHeader } from "./dashboard-header"
import type { UserRole } from "@/lib/types"
import { BookOpen, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  role: UserRole
  children: React.ReactNode
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const { isAuthenticated, currentUser } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!currentUser) return
    if (currentUser.role !== role) {
      router.push(`/dashboard/${currentUser.role}`)
    }
  }, [currentUser, role, router])

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col glass border-y-0 border-l-0 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 rounded-none shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute bottom-[10%] left-[-10%] w-24 h-24 bg-primary/10 blur-3xl rounded-full pointer-events-none z-0" />
        <div className="absolute top-[20%] right-[-5%] text-emerald-500/10 pointer-events-none z-0">
          <Sparkles className="w-12 h-12" />
        </div>
        
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 overflow-hidden p-1 shadow-sm border border-slate-200">
            <BookOpen className="h-5 w-5 text-slate-500" />
          </div>
          <span className="text-lg font-bold text-slate-600 tracking-tight">
            Edura
          </span>
          <button
            className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={role} />
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
              {currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {currentUser.name}
              </span>
              <span className="text-xs capitalize text-sidebar-foreground/60">
                {currentUser.role}
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-[8px] uppercase tracking-[0.2em] text-sidebar-foreground/20 font-bold text-center">
            made by AegisAI
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative bg-mesh">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
