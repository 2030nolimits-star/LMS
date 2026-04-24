"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences.
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              General Settings
            </CardTitle>
            <CardDescription>
              Basic configuration for the edura platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="siteName">Platform Name</Label>
              <Input id="siteName" defaultValue="edura" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="siteUrl">Platform URL</Label>
              <Input id="siteUrl" defaultValue="https://edura.university.edu" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                defaultValue="admin@university.edu"
              />
            </div>
            <Button
              className="w-fit"
              onClick={() => toast.success("Settings saved!")}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Registration & Access
            </CardTitle>
            <CardDescription>
              Control how users can register and access the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Open Registration
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow new users to register without admin invitation.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Require Admin Approval
                </p>
                <p className="text-xs text-muted-foreground">
                  New accounts need admin approval before accessing the
                  platform.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Email Verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Require users to verify their email address.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Live Classes
            </CardTitle>
            <CardDescription>
              Configure video conferencing settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Auto-Record Sessions
                </p>
                <p className="text-xs text-muted-foreground">
                  Automatically record all live class sessions.
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Auto-Attendance
                </p>
                <p className="text-xs text-muted-foreground">
                  Mark attendance automatically when students join live
                  classes.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label>Max Session Duration (minutes)</Label>
              <Input type="number" defaultValue={120} className="w-32" />
            </div>
            <Button
              className="w-fit"
              onClick={() => toast.success("Settings saved!")}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
