"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Building, Calendar, Hash } from "lucide-react"

export default function ProfilePage() {
  const { currentUser } = useAuth()

  if (!currentUser) return null

  return (
    <DashboardShell role={currentUser.role}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and account settings.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 border-border/50 glass">
            <CardContent className="flex flex-col items-center pt-8 pb-8">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                  {currentUser.name[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold text-foreground">{currentUser.name}</h2>
              <Badge className="mt-2 capitalize" variant="outline">
                {currentUser.role}
              </Badge>
              <div className="mt-6 w-full space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground capitalize">{currentUser.role} Account</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-border/50 glass">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>View your institutional records and account status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Registration Number
                  </p>
                  <p className="text-sm font-semibold">{currentUser.registrationNumber || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Building className="h-3 w-3" /> Department
                  </p>
                  <p className="text-sm font-semibold">{currentUser.department || "General"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Joined Date
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(currentUser.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Account Status
                  </p>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
