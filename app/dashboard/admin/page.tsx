"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import {
  Users,
  BookOpen,
  Video,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Loader2,
} from "lucide-react"
import { getAdminDashboardData, updateUserStatus, getAllUsers } from "@/lib/queries"
import type { User, LiveClass } from "@/lib/types"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    students: number;
    teachers: number;
    courses: number;
    pending: User[];
    activeLive: LiveClass[];
    users: User[]; // Added users to state
  }>({
    students: 0,
    teachers: 0,
    courses: 0,
    pending: [],
    activeLive: [],
    users: [],
  })

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true);
    try {
      const [stats, allUsers] = await Promise.all([
        getAdminDashboardData(),
        getAllUsers()
      ]);
      setData({ ...stats, users: allUsers as any });
    } catch (error) {
      console.error("Admin dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (userId: string, status: "active" | "rejected") => {
    try {
      await updateUserStatus(userId, status);
      toast.success(`User ${status} successfully`);
      loadData();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  }

  if (!currentUser) return null

  const { students, courses: courseCount, pending, activeLive: liveNow, users } = data
  const teachers = data.teachers

  const stats = [
    {
      label: "Total Students",
      value: students,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Courses",
      value: courseCount,
      icon: BookOpen,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Total Teachers",
      value: teachers,
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Current Live",
      value: liveNow.length,
      icon: Video,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ]

  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System overview and management tools.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending approvals */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                Pending Approvals
              </CardTitle>
              <Link href="/dashboard/admin/users">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No pending approvals
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-warning/10 text-xs text-warning">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.registrationNumber || "Unassigned"} - {user.role}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleStatusUpdate(user.id, "active")}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(user.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live sessions */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                Active Sessions
              </CardTitle>
              <Badge variant={liveNow.length > 0 ? "destructive" : "secondary"}>
                {liveNow.length} live
              </Badge>
            </CardHeader>
            <CardContent>
              {liveNow.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No active sessions
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {liveNow.map((lc) => (
                    <div
                      key={lc.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                        <Video className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {lc.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lc.teacherName} - {lc.attendees.length} attendees
                        </p>
                      </div>
                      <Badge className="bg-destructive text-destructive-foreground">
                        LIVE
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent users */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              All Users ({users.length})
            </CardTitle>
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm" className="text-xs">
                Manage <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {users.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                  <Badge
                    variant={
                      user.status === "active"
                        ? "default"
                        : user.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
