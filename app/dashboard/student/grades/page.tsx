"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, TrendingUp, Award, BookOpen } from "lucide-react"

const demoGrades = [
  { id: "1", assignmentTitle: "Binary Trees Lab",        courseCode: "CS301",   courseName: "Data Structures & Algorithms", score: 94, maxScore: 100 },
  { id: "2", assignmentTitle: "Matrix Operations",        courseCode: "MATH201", courseName: "Linear Algebra",               score: 88, maxScore: 100 },
  { id: "3", assignmentTitle: "Regression Analysis",      courseCode: "CS401",   courseName: "Machine Learning",             score: 76, maxScore: 100 },
  { id: "4", assignmentTitle: "Wave Mechanics Quiz",      courseCode: "PHY101",  courseName: "Engineering Physics",          score: 91, maxScore: 100 },
  { id: "5", assignmentTitle: "Graph Traversal Task",     courseCode: "CS301",   courseName: "Data Structures & Algorithms", score: 86, maxScore: 100 },
  { id: "6", assignmentTitle: "Eigenvalue Problem Set",   courseCode: "MATH201", courseName: "Linear Algebra",               score: 79, maxScore:  50 },
]

function getLetterGrade(pct: number) {
  if (pct >= 93) return "A"
  if (pct >= 90) return "A-"
  if (pct >= 87) return "B+"
  if (pct >= 83) return "B"
  if (pct >= 80) return "B-"
  if (pct >= 77) return "C+"
  if (pct >= 73) return "C"
  return "C-"
}

export default function StudentGradesPage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  const avg = Math.round(demoGrades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / demoGrades.length)
  const gpa = (avg / 25).toFixed(2)

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh">
        <div className="pointer-events-none absolute -top-10 right-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div>
          <h1 className="text-3xl font-bold text-foreground">Academic Overview</h1>
          <p className="text-muted-foreground mt-1">Track your GPA, credits, and recent assignment performance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: GraduationCap, label: "Current GPA",       value: gpa,       color: "text-primary",     bg: "bg-primary/15",      glow: "glow-primary"  },
            { icon: TrendingUp,    label: "Overall Average",   value: `${avg}%`,  color: "text-emerald-400", bg: "bg-emerald-500/15",  glow: "glow-success"  },
            { icon: Award,         label: "Total Credits",     value: "18",       color: "text-amber-400",   bg: "bg-amber-500/15",    glow: "glow-warning"  },
          ].map((s) => (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg} ${s.glow}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grades table */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Detailed Records
          </h2>
          <div className="flex flex-col gap-2">
            {demoGrades.map((grade) => {
              const pct = Math.round((grade.score / grade.maxScore) * 100)
              const letter = getLetterGrade(pct)
              const colorClass = pct >= 90 ? "text-emerald-400" : pct >= 75 ? "text-amber-400" : "text-rose-400"
              const bgClass   = pct >= 90 ? "bg-emerald-500/15" : pct >= 75 ? "bg-amber-500/15" : "bg-rose-500/15"
              return (
                <div key={grade.id} className="flex items-center gap-4 rounded-xl bg-white/5 border border-white/8 p-4 hover:bg-white/8 transition-colors">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass} text-base font-bold ${colorClass}`}>
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{grade.assignmentTitle}</p>
                    <p className="text-xs text-muted-foreground">{grade.courseCode} · {grade.courseName}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">{grade.score}/{grade.maxScore}</span>
                    <Badge className={`border-none ${bgClass} ${colorClass}`}>{pct}%</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
