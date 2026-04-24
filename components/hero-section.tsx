"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, GraduationCap, Briefcase } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden bg-background">
      {/* Subtle Atmospheric Glows */}
      <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="w-3 h-3" />
              Intelligence Meets Education
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-800 leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              Empowering Your <span className="text-emerald-500 italic">Academic</span> Journey with AI.
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
              Your Intelligent Academic & Career Co-Pilot. We analyze your potential, guide your studies, and accelerate your career path with precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg gap-2 saas-shadow hover:scale-105 transition-transform">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg glass hover:bg-slate-50">
                  Access Portal
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 animate-in fade-in duration-1000 delay-500">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-slate-800">10k+</span>
                <span className="text-sm text-slate-500 font-medium">Students Joined</span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-emerald-500">98%</span>
                <span className="text-sm text-slate-500 font-medium">Efficiency Rate</span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden shadow-sm">
                      {i === 4 ? "+5k" : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />}
                    </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000 lg:pl-12">
            <div className="relative flex flex-col gap-6">
              {/* CSS-based Minimalist UI Preview */}
              <div className="glass p-6 rounded-[2rem] saas-shadow border-white/40 w-full max-w-sm ml-auto animate-bounce-slow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-2" />
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-1 my-1 w-full bg-slate-100 rounded-full" />
                  <div className="h-1 my-1 w-[90%] bg-slate-100 rounded-full" />
                  <div className="h-1 my-1 w-[95%] bg-slate-100 rounded-full" />
                </div>
              </div>

              <div className="glass p-8 rounded-[2rem] saas-shadow border-white/40 w-full max-w-md animate-bounce-slow" style={{ animationDelay: '2s' }}>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Insights</h4>
                  <div className="h-6 w-12 bg-emerald-500/10 rounded-full" />
                </div>
                <div className="flex items-end gap-3 h-32">
                   {[40, 70, 45, 90, 65, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-primary/20 to-primary/5 rounded-t-lg transition-all hover:from-primary/40" style={{ height: `${h}%` }} />
                   ))}
                </div>
              </div>

              <div className="absolute -bottom-12 right-12 glass p-4 rounded-2xl saas-shadow border-white/40 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">Career Link Established</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
