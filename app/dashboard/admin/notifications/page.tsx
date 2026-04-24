"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Settings, CheckCheck, Loader2, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNotifications, markNotificationAsRead, publishGlobalNotification } from "@/lib/queries"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const typeConfig: Record<string, { color: string; bg: string }> = {
  grade: { color: "text-success", bg: "bg-success/10" },
  material: { color: "text-primary", bg: "bg-primary/10" },
  class: { color: "text-destructive", bg: "bg-destructive/10" },
  assignment: { color: "text-warning", bg: "bg-warning/10" },
  system: { color: "text-muted-foreground", bg: "bg-muted" },
  attendance: { color: "text-primary", bg: "bg-primary/10" },
}

export default function AdminNotificationsPage() {
  const { currentUser } = useAuth()
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [newGlobal, setNewGlobal] = useState({
    title: "",
    message: "",
    type: "info" as any
  })

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    setLoading(true);
    try {
      const data = await getNotifications(currentUser!.id);
      setNotifs(data);
    } catch (e) {
      console.error("Notifications load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(notifs.filter(n => !n.read).map(n => markNotificationAsRead(n.id)));
      loadData();
    } catch (e) {
      toast.error("Failed to update status");
    }
  }

  const handlePublishGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await publishGlobalNotification(newGlobal.title, newGlobal.message, newGlobal.type);
      toast.success("Global notification broadcasted!");
      setNewGlobal({ title: "", message: "", type: "info" });
    } catch (e) {
      toast.error("Bridge failure: Could not broadcast alert");
    } finally {
      setPublishing(false);
    }
  }

  if (!currentUser) return null

  if (loading) {
    return (
      <DashboardShell role="admin">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  const unreadCount = notifs.filter((n) => !n.read).length

  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
              }
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Global Broadcast Center */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Global Broadcast</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePublishGlobal} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Title</label>
                    <Input 
                      placeholder="Maintenance Update..." 
                      value={newGlobal.title}
                      onChange={(e) => setNewGlobal({...newGlobal, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Type</label>
                    <Select value={newGlobal.type} onValueChange={(val) => setNewGlobal({...newGlobal, type: val as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Message</label>
                    <Textarea 
                      placeholder="The platform will be undergoing..." 
                      rows={4}
                      value={newGlobal.message}
                      onChange={(e) => setNewGlobal({...newGlobal, message: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={publishing}>
                    {publishing ? "Broadcasting..." : "Broadcast Alert"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Inbox</h2>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            {notifs.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="flex flex-col items-center py-12">
                  <Bell className="mb-4 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No personal notifications</p>
                </CardContent>
              </Card>
            ) : (
              notifs
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((notif) => {
                  const config = typeConfig[notif.type] || typeConfig.system
                  return (
                    <Card
                      key={notif.id}
                      className={cn(
                        "border-border/50 transition-colors",
                        !notif.read && "border-l-4 border-l-primary bg-primary/[0.02]"
                      )}
                    >
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.bg)}>
                          <Settings className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-sm", !notif.read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                              {notif.title}
                            </p>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-xs"
                            onClick={async () => {
                              await markNotificationAsRead(notif.id);
                              loadData();
                            }}
                          >
                            Mark read
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
