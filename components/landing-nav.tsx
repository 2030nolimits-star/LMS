"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-x-0 border-t-0 border-b border-white/10 px-6 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500 saas-shadow p-1">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-700 tracking-tight">
            Edura
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
          <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
