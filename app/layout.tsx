import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "edura - Learning Management System",
  description:
    "A comprehensive learning management system for students, teachers, and administrators.",
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-foreground min-h-screen selection:bg-primary/20 relative overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Soft custom background with massive very light pastel lavender purple blurs */}
          <div className="fixed inset-0 pointer-events-none z-[-3] bg-[#FCFBFF] dark:bg-[#09090b]"></div>
          <div className="fixed top-[-20%] left-[-15%] w-[80%] h-[80%] bg-[#F3E8FF]/80 dark:bg-zinc-800/20 rounded-full blur-[140px] pointer-events-none z-[-2]"></div>
          <div className="fixed bottom-[-20%] right-[-15%] w-[70%] h-[70%] bg-[#F5F3FF]/80 dark:bg-zinc-900/40 rounded-full blur-[120px] pointer-events-none z-[-2]"></div>
          <div className="fixed top-[40%] left-[60%] w-[40%] h-[40%] bg-[#E9D5FF]/50 dark:bg-stone-800/10 rounded-full blur-[100px] pointer-events-none z-[-2]"></div>
          
          {/* Lavender decorative atmospheric glows instead of stickers */}
          <div className="fixed top-[15%] right-[10%] w-32 h-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none z-[-1] hidden lg:block" />
          <div className="fixed bottom-[10%] left-[5%] w-24 h-24 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none z-[-1] hidden lg:block" />
          <div className="fixed top-[20%] left-[8%] w-16 h-16 bg-blue-400/10 blur-[60px] rounded-full pointer-events-none z-[-1] hidden md:block" />
          <div className="fixed bottom-[30%] right-[3%] w-20 h-20 bg-purple-400/10 blur-[70px] rounded-full pointer-events-none z-[-1] hidden xl:block" />

          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
