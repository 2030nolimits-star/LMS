"use client"

import { Brain, Target, LineChart, ShieldCheck, Zap, Globe } from "lucide-react"

const features = [
  {
    title: "AI Academic Analysis",
    description: "Our neural engines analyze your performance trends to suggest the best study patterns tailored for you.",
    icon: Brain,
    color: "bg-emerald-500/10 text-emerald-600"
  },
  {
    title: "Career Path Mapping",
    description: "Align your academic choices with your dream career using our intelligent prediction models.",
    icon: Target,
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    title: "Progress Visualization",
    description: "Stunning real-time dashboards to track your growth across all academic disciplines.",
    icon: LineChart,
    color: "bg-violet-500/10 text-violet-600"
  },
  {
    title: "Trusted Security",
    description: "Your academic data is protected with enterprise-grade encryption and privacy controls.",
    icon: ShieldCheck,
    color: "bg-slate-500/10 text-slate-600"
  },
  {
    title: "Fast-Track Learning",
    description: "Accelerate your knowledge acquisition with curated resources and automated summarization.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    title: "Global Collaboration",
    description: "Connect with students and mentors worldwide to enhance your learning perspective.",
    icon: Globe,
    color: "bg-sky-500/10 text-sky-600"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4">Core Capabilities</h2>
          <p className="text-4xl font-bold text-slate-800 tracking-tight">Everything you need to <span className="italic text-emerald-500">Excel</span>.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="glass p-8 rounded-[2rem] border-none saas-shadow hover:translate-y-[-8px] transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
