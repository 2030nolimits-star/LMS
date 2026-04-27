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
  const [activeContact, setActiveContact] = useState(demoContacts[0])
  const [messages, setMessages] = useState(demoMessages)
  const [inputText, setInputText] = useState("")

  if (!currentUser) return null

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMsg = {
      id: `m${Date.now()}`,
      sender: "Me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }
    setMessages([...messages, newMsg])
    setInputText("")
  }

  return (
    <DashboardShell role="student">
      <div className="relative flex flex-col gap-6 bg-mesh h-[calc(100vh-8rem)]">
        {/* Decorative blur */}
        <div className="pointer-events-none absolute -top-20 left-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] -translate-x-1/2" />

        <div className="flex-1 glass-card overflow-hidden flex shadow-2xl border-white/10" style={{ padding: 0 }}>
          
          {/* Sidebar / Contacts */}
          <div className="w-80 border-r border-white/10 flex flex-col hidden md:flex bg-white/[0.02] backdrop-blur-md">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Messages</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5">
                   <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {demoContacts.map((contact) => {
                const isActive = activeContact.id === contact.id
                return (
                  <div 
                    key={contact.id} 
                    onClick={() => setActiveContact(contact)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 group relative",
                      isActive ? "bg-white/[0.08] shadow-lg" : "hover:bg-white/5"
                    )}
                  >
                    {isActive && <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full" />}
                    <div className="relative shrink-0">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-inner",
                        contact.color,
                        isActive ? "scale-105" : "group-hover:scale-105"
                      )}>
                        {contact.name.charAt(0)}
                      </div>
                      {contact.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#121214] shadow-lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={cn("text-sm truncate transition-colors", isActive ? "font-bold text-foreground" : "font-semibold text-muted-foreground group-hover:text-foreground")}>
                          {contact.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70">{contact.time}</span>
                      </div>
                      <p className={cn("text-xs truncate transition-colors", isActive ? "text-foreground/80" : "text-muted-foreground/60 group-hover:text-muted-foreground")}>
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unread > 0 && !isActive && (
                      <div className="h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                        {contact.unread}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white/[0.01]">
             {/* Chat Header */}
             <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-white/[0.02] backdrop-blur-xl z-10">
               <div className="flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-lg", activeContact.color)}>
                    {activeContact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground leading-tight">{activeContact.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn("h-2 w-2 rounded-full", activeContact.online ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")}></span>
                      <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                        {activeContact.online ? "Active Now" : "Offline"}
                      </p>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/10 rounded-xl">
                   <Search className="h-5 w-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/10 rounded-xl">
                   <MoreVertical className="h-5 w-5" />
                 </Button>
               </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-mesh/20">
                <div className="flex justify-center my-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                    Today, April 27
                  </span>
                </div>
                
                {messages.map((msg, idx) => {
                  const isLastOfGroup = idx === messages.length - 1 || messages[idx+1]?.isMe !== msg.isMe;
                  
                  return (
                    <div key={msg.id} className={cn("flex group animate-in fade-in slide-in-from-bottom-2 duration-300", msg.isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        "max-w-[75%] flex flex-col gap-2",
                        msg.isMe ? 'items-end' : 'items-start'
                      )}>
                        <div className={cn(
                          "px-5 py-3.5 text-sm leading-relaxed shadow-xl transition-all",
                          msg.isMe 
                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-3xl rounded-tr-sm font-medium' 
                            : 'bg-white/5 border border-white/10 text-foreground rounded-3xl rounded-tl-sm backdrop-blur-md hover:bg-white/8'
                        )}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                            {msg.time}
                          </span>
                          {msg.isMe && isLastOfGroup && <CheckCircle2 className="h-3 w-3 text-primary/40" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
             </div>

             {/* Input */}
             <div className="p-6 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl">
               <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-3xl p-2.5 shadow-2xl focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                 <Button type="button" variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0">
                   <Paperclip className="h-5 w-5" />
                 </Button>
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   placeholder={`Message ${activeContact.name.split(' ')[1]}...`} 
                   className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50 px-3 py-2"
                 />
                 <Button type="button" variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0 hidden sm:flex">
                   <Smile className="h-5 w-5" />
                 </Button>
                 <Button 
                   type="submit" 
                   size="icon" 
                   className="h-11 w-11 rounded-2xl shrink-0 bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                 >
                   <Send className="h-4 w-4" />
                 </Button>
               </form>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

import { useState } from "react"
import { cn } from "@/lib/utils"
import { PlusCircle, CheckCircle2 } from "lucide-react"
