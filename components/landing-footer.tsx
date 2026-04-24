"use client"

import { BookOpen, Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500 saas-shadow p-1">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-700 tracking-tight">
                Edura
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Revolutionizing the academic experience with intelligent AI-driven insights for students and educators worldwide.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors"><Github className="w-5 h-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Edura Platform. All rights reserved.
          </p>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300 font-bold italic mb-1">
              made by AegisAI
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
