"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookOpen, Eye, EyeOff, Sparkles, Star, GraduationCap, Video, MessageSquare, Activity, Bell, FileText, Brain } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const demoAccounts = [
  { label: "Student", reg: "STU-2025-001", role: "student" as const },
  { label: "Teacher", reg: "TCH-2020-001", role: "teacher" as const },
  { label: "Admin", reg: "ADM-2018-001", role: "admin" as const },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, currentUser } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(identifier, password)
      if (success) {
        // Redirect will happen automatically via useEffect
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  // Redirect if logged in
  useEffect(() => {
    if (currentUser) {
      router.push(`/dashboard/${currentUser.role}`)
    }
  }, [currentUser, router])

  const handleDemoLogin = (reg: string) => {
    setIdentifier(reg)
    setPassword("password123")
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left panel - branding */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-transparent p-12 lg:flex relative overflow-hidden">
        <div className="flex max-w-md flex-col items-start z-10 w-full glass p-10 rounded-[2.5rem] saas-shadow border-none relative overflow-visible group">
          {/* Rich Abstract Atmosphere Decorations */}
          {/* Blobs */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/30 blur-3xl rounded-full" />
          <div className="absolute top-[20%] right-[-10%] w-24 h-24 bg-blue-400/20 blur-2xl rounded-full" />
          <div className="absolute -bottom-16 left-[20%] w-32 h-32 bg-emerald-500/25 blur-3xl rounded-full" />
          <div className="absolute bottom-[10%] -right-12 w-20 h-20 bg-purple-400/20 blur-2xl rounded-full" />
          
          {/* Educational "Stickers" (Icons) */}
          <div className="absolute top-8 right-8 text-primary/60 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="absolute top-[12%] left-[-15%] text-emerald-500/40 animate-bounce-slow">
            <GraduationCap className="h-10 w-10" />
          </div>
          <div className="absolute top-[40%] right-[-12%] text-blue-400/30 animate-bounce-slow" style={{ animationDelay: '1s' }}>
            <Video className="h-8 w-8" />
          </div>
          <div className="absolute bottom-[15%] left-[-8%] text-purple-400/40 animate-bounce-slow" style={{ animationDelay: '2s' }}>
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="absolute -bottom-10 right-[30%] text-primary/30 animate-pulse">
            <Brain className="h-8 w-8" />
          </div>
          <div className="absolute top-[60%] left-[-12%] text-slate-400/20 animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
            <Activity className="h-6 w-6" />
          </div>

          <div className="mb-12 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 saas-shadow overflow-hidden p-2 backdrop-blur-sm z-10">
            <BookOpen className="h-8 w-8 text-slate-500" />
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-500 leading-tight z-10">
            Edura
          </h1>
          <p className="text-xl leading-relaxed text-slate-600 font-light z-10">
            Your Intelligent Academic <span className="text-primary font-semibold">& Career</span> Co-Pilot.
          </p>

          {/* Floatin Glass Shards */}
          <div className="absolute top-[35%] -right-4 w-12 h-16 glass border-white/60 rotate-12 rounded-lg opacity-60 group-hover:rotate-0 transition-transform duration-700 z-20" />
          <div className="absolute -top-6 left-[40%] w-10 h-10 glass border-white/60 -rotate-12 rounded-lg opacity-40 group-hover:rotate-0 transition-transform duration-1000 z-20" />
          <div className="absolute -bottom-12 right-[10%] w-14 h-14 glass border-white/60 rotate-45 rounded-xl opacity-50 group-hover:rotate-0 transition-transform duration-500 z-20" />
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-transparent">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500 saas-shadow p-1">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-600 tracking-tight">
              Edura
            </span>
          </div>

          <Card className="glass border-none saas-shadow rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
              <CardDescription>
                Enter your registration number or email to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="identifier">Registration Number / Email</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="e.g. STU-2025-001 or name@edu.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      Quick demo access
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {demoAccounts.map((account) => (
                    <Button
                      key={account.role}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        handleDemoLogin(account.reg)
                      }
                    >
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                        {account.label[0]}
                      </span>
                      Sign in as {account.label}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {account.reg}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Register here
                </Link>
              </p>
              
              <div className="mt-8 pt-4 border-t border-border/50 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/30 font-medium italic">
                  made by AegisAI
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
