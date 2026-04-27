"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Search, MoreVertical, Send, Smile, Paperclip } from "lucide-react"

// Rich demo data for messaging interface
const demoContacts = [
  { id: "1", name: "Dr. James Carter", role: "Professor",   course: "CS301", lastMessage: "Yes, the lab is due on Friday.", time: "10:42 AM", unread: 2, online: true, color: "bg-rose-500" },
  { id: "2", name: "Prof. Sarah Kim",  role: "Professor",   course: "MATH201", lastMessage: "I've uploaded the matrix guides.", time: "Yesterday", unread: 0, online: false, color: "bg-emerald-500" },
  { id: "3", name: "Alex Johnson",     role: "Student",     course: "CS301", lastMessage: "Are you ready for the quiz?", time: "Monday", unread: 0, online: true, color: "bg-primary" },
  { id: "4", name: "Dr. Ahmed Hassan", role: "Professor",   course: "CS401", lastMessage: "Your regression model was excellent.", time: "Last Week", unread: 0, online: false, color: "bg-amber-500" },
]

const demoMessages = [
  { id: "m1", sender: "Dr. James Carter", text: "Hello! Did you have any questions regarding the Binary Trees lab assignment?", time: "10:30 AM", isMe: false },
  { id: "m2", sender: "Me", text: "Hi Professor, yes I did. I was wondering if we need to implement the deletion method as well?", time: "10:35 AM", isMe: true },
  { id: "m3", sender: "Dr. James Carter", text: "It's highly recommended for extra credit, but the core requirement is just insertion and traversal.", time: "10:40 AM", isMe: false },
  { id: "m4", sender: "Dr. James Carter", text: "Yes, the lab is due on Friday.", time: "10:42 AM", isMe: false },
]

export default function StudentChatPage() {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute -top-10 left-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl -translate-x-1/2" />

        <div className="flex-1 glass-card overflow-hidden flex" style={{ padding: 0 }}>
          
          {/* Sidebar / Contacts */}
          <div className="w-80 border-r border-white/10 flex flex-col hidden md:flex bg-white/[0.02]">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-foreground mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {demoContacts.map((contact, i) => (
                <div key={contact.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${i === 0 ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <div className="relative">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg ${contact.color}`}>
                      {contact.name.charAt(0)}
                    </div>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#161618]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                      <span className="text-xs text-muted-foreground">{contact.time}</span>
                    </div>
                    <p className={`text-xs truncate ${contact.unread > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {contact.lastMessage}
                    </p>
                  </div>
                  {contact.unread > 0 && (
                    <div className="h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
             {/* Chat Header */}
             <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.01]">
               <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold bg-rose-500">
                    D
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Dr. James Carter</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
                    </p>
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                 <MoreVertical className="h-5 w-5" />
               </Button>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="flex justify-center">
                  <span className="text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-full">Today</span>
                </div>
                
                {demoMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col gap-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${msg.isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-white/10 text-foreground rounded-tl-sm border border-white/5'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
             </div>

             {/* Input */}
             <div className="p-4 border-t border-white/10 bg-white/[0.02]">
               <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-2xl p-2 pr-3">
                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0">
                   <Paperclip className="h-5 w-5" />
                 </Button>
                 <input 
                   type="text" 
                   placeholder="Type your message..." 
                   className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground px-2"
                 />
                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0">
                   <Smile className="h-5 w-5" />
                 </Button>
                 <Button size="icon" className="h-10 w-10 rounded-xl shrink-0">
                   <Send className="h-4 w-4" />
                 </Button>
               </div>
             </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
