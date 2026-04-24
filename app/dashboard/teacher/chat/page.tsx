"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Search, MoreVertical, Send, Smile, Paperclip, Loader2 } from "lucide-react"
import { getConversations, getMessages, sendMessage, getAllUsers } from "@/lib/queries"
import type { User } from "@/lib/types"

export default function TeacherChatPage() {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser])

  async function loadData() {
    try {
      const [convs, users] = await Promise.all([
        getConversations(currentUser!.id),
        getAllUsers()
      ]);
      setConversations(convs);
      setAllUsers(users.filter(u => u.id !== currentUser!.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeConversation && currentUser) {
      getMessages(currentUser.id, activeConversation.other.id).then(setMessages);
    }
  }, [activeConversation, currentUser])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;
    
    try {
      const msg = await sendMessage(currentUser.id, activeConversation.other.id, newMessage);
      setMessages([...messages, msg]);
      setNewMessage("");
    } catch (e) {
      console.error(e);
    }
  }

  if (!currentUser) return null

  if (loading) {
    return (
      <DashboardShell role="teacher">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="teacher">
      <div className="relative flex flex-col gap-6 bg-mesh h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute -top-10 left-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -translate-x-1/2" />

        <div className="flex-1 glass-card overflow-hidden flex" style={{ padding: 0 }}>
          
          {/* Sidebar / Contacts */}
          <div className="w-80 border-r border-white/10 flex flex-col hidden md:flex bg-white/[0.02]">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-foreground mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 && (
                <div className="p-4 text-xs text-muted-foreground text-center">No active chats. Start a new one with a user below.</div>
              )}
              {conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveConversation(conv)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeConversation?.id === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="relative">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg bg-emerald-500/20 text-emerald-400`}>
                      {conv.other.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">{conv.other.name}</p>
                      <span className="text-[10px] text-muted-foreground">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-[10px] font-bold text-emerald-950 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">All Users</div>
              {allUsers.filter(u => !conversations.some(c => c.other.id === u.id)).map(user => (
                <div 
                  key={user.id} 
                  onClick={() => setActiveConversation({ id: `new-${user.id}`, other: user, lastMessage: "", timestamp: new Date().toISOString(), unreadCount: 0 })}
                  className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold">{user.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
             {activeConversation ? (
               <>
                 {/* Chat Header */}
                 <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.01]">
                   <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold bg-emerald-500/20 text-emerald-400">
                        {activeConversation.other.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{activeConversation.other.name}</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Active
                        </p>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                     <MoreVertical className="h-5 w-5" />
                   </Button>
                 </div>

                 {/* Messages */}
                 <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {messages.length === 0 && <div className="text-center text-xs text-muted-foreground py-10">No messages yet. Send a greeting!</div>}
                    {messages.map(msg => {
                      const isMe = msg.sender_id === currentUser.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-emerald-500 text-emerald-950 rounded-tr-sm shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-foreground rounded-tl-sm border border-white/5'}`}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground px-1">
                              {new Date(msg.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                 </div>

                 {/* Input */}
                 <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/[0.02]">
                   <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-2xl p-2 pr-3">
                     <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0">
                       <Paperclip className="h-5 w-5" />
                     </Button>
                     <input 
                       type="text" 
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       placeholder="Type your message..." 
                       className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground px-2"
                     />
                     <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shrink-0" disabled={!newMessage.trim()}>
                       <Send className="h-4 w-4" />
                     </Button>
                   </div>
                 </form>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                   <MessageSquare className="h-8 w-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground">Select a conversation</h3>
                 <p className="text-sm text-muted-foreground mt-1 max-w-xs">Communicate with students and faculty members in real-time.</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}

import { MessageSquare as MessageSquareIcon } from "lucide-react"
