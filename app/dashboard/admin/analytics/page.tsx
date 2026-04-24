"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getAdminDashboardData } from "@/lib/queries"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadData();
  }, [])

  async function loadData() {
    setLoading(true);
    try {
      const result = await getAdminDashboardData();
      setData(result);
    } catch (e) {
      console.error("Analytics load error:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell role="admin">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  // Attendance stats (Pie)
  const presentCount = data.attendanceRaw.filter((a: any) => a.status === "present").length
  const lateCount = data.attendanceRaw.filter((a: any) => a.status === "late").length
  const absentCount = data.attendanceRaw.filter((a: any) => a.status === "absent").length
  const totalAtt = data.attendanceRaw.length

  const attendancePieData = [
    { name: "Present", value: presentCount },
    { name: "Late", value: lateCount },
    { name: "Absent", value: absentCount },
  ]
  const PIE_COLORS = [
    "hsl(142, 76%, 36%)",
    "hsl(38, 92%, 50%)",
    "hsl(0, 72%, 51%)",
  ]

  // Grade distribution by course (Bar)
  // submissionsRaw has grade, assignments(course_id)
  const gradesByCourseMap = new Map();
  data.submissionsRaw.forEach((s: any) => {
    const cId = s.assignments?.course_id;
    if (!gradesByCourseMap.has(cId)) gradesByCourseMap.set(cId, { sum: 0, count: 0 });
    const entry = gradesByCourseMap.get(cId);
    entry.sum += (s.grade / s.assignments.max_score);
    entry.count++;
  });

  const gradesByCourse = data.coursesRaw.map((c: any) => {
    const entry = gradesByCourseMap.get(c.id);
    return {
      name: c.code,
      average: entry ? Math.round((entry.sum / entry.count) * 100) : 0
    }
  });

  // Enrollment data (Bar)
  const enrollmentData = data.coursesRaw.map((c: any) => ({
    name: c.code,
    enrolled: c.enrollments?.[0]?.count || 0
  }));


  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            System-wide statistics and performance metrics.
          </p>
        </div>

        {/* Top-level stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {data.students + data.teachers}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {data.coursesCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Attendance Rate
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {data.attendanceRate}%
              </p>
              <Progress value={data.attendanceRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Live Sessions
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {data.activeLive.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Grade averages by course */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Average Grades by Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradesByCourse}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar
                      dataKey="average"
                      fill="hsl(234, 89%, 58%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendance pie chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Attendance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {attendancePieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Enrollment by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar
                    dataKey="enrolled"
                    fill="hsl(160, 60%, 45%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
