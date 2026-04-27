"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Search, MoreVertical, Send, Smile, Paperclip, Loader2, MessageSquare as MessageSquareIcon, ArrowLeft, User as UserIcon } from "lucide-react"
import { getConversations, getMessages, sendMessage, getAllUsers, markMessagesAsRead } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"
import { toast } from "sonner"

export default function TeacherChatPage() {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true)

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
      const filtered = users.filter(u => u.id !== currentUser!.id && !convs.some(c => c.other.id === u.id));
      setAllUsers(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeConversation && currentUser) {
      setShowSidebarOnMobile(false);
      getMessages(currentUser.id, activeConversation.other.id).then(setMessages);
      markMessagesAsRead(currentUser.id, activeConversation.other.id).then(() => loadData());

      const channel = supabase
        .channel(`chat_messages_sync`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeConversation.other.id) ||
            (newMsg.sender_id === activeConversation.other.id && newMsg.receiver_id === currentUser.id)
          ) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          loadData();
        })
        .subscribe();

      const pollInterval = setInterval(() => {
        if (activeConversation) {
          getMessages(currentUser.id, activeConversation.other.id).then(setMessages);
          loadData();
        }
      }, 5000);

      return () => { 
        supabase.removeChannel(channel);
        clearInterval(pollInterval);
      };
    } else {
      setShowSidebarOnMobile(true);
    }
  }, [activeConversation, currentUser])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;
    
    setSubmitting(true);
    try {
      const msg = await sendMessage(currentUser.id, activeConversation.other.id, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.other.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className={cn(
            "w-80 border-r border-white/10 flex flex-col bg-white/[0.02] absolute inset-y-0 left-0 z-20 md:relative transition-transform duration-300 md:translate-x-0",
            showSidebarOnMobile ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-foreground mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..." 
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredConversations.length === 0 && searchQuery && (
                <div className="p-4 text-xs text-muted-foreground text-center">No results for "{searchQuery}"</div>
              )}
              
              {filteredConversations.map((conv) => (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveConversation(conv)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    activeConversation?.other?.id === conv.other.id ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "hover:bg-white/5"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg",
                      conv.other.role === "student" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {(conv.other.name || "U").charAt(0)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-[10px] font-bold text-emerald-950 flex items-center justify-center border-2 border-background animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">{conv.other.name}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {conv.timestamp ? new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-emerald-400 font-medium" : "text-muted-foreground")}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
              
              {(filteredAllUsers.length > 0 || searchQuery) && (
                <div className="mt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                  <UserIcon className="h-3 w-3" />
                  {searchQuery ? "Search Results" : "All Users"}
                </div>
              )}
              
              {filteredAllUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => setActiveConversation({ id: `new-${user.id}`, other: user, lastMessage: "", timestamp: new Date().toISOString(), unreadCount: 0 })}
                  className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold">{(user.name || "U").charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
             {activeConversation ? (
               <>
                 <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.01]">
                   <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden" 
                        onClick={() => setActiveConversation(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold",
                        activeConversation.other.role === "student" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {(activeConversation.other.name || "U").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-foreground truncate">{activeConversation.other.name}</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1 uppercase tracking-tighter font-bold">
                          {activeConversation.other.role}
                        </p>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                     <MoreVertical className="h-5 w-5" />
                   </Button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-mesh">
                    {messages.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                        <MessageSquareIcon className="h-12 w-12 mb-2" />
                        <p className="text-sm italic">Start a conversation with {activeConversation.other.name}</p>
                      </div>
                    )}
                    {messages.map(msg => {
                      const isMe = msg.sender_id === currentUser.id;
                      return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[85%] md:max-w-[70%] flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                            <div className={cn(
                              "px-4 py-3 rounded-2xl break-words",
                              isMe ? "bg-emerald-500 text-emerald-950 rounded-tr-sm shadow-lg shadow-emerald-500/20" : "bg-white/10 text-foreground rounded-tl-sm border border-white/5"
                            )}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground px-1">
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                 </div>

                 <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/[0.02]">
                   <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-2xl p-2 pr-3">
                     <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0 hidden sm:flex">
                       <Paperclip className="h-5 w-5" />
                     </Button>
                     <input 
                       type="text" 
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       placeholder="Type your message..." 
                       className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground px-2"
                     />
                     <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0">
                       <Smile className="h-5 w-5" />
                     </Button>
                     <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shrink-0 bg-emerald-500 text-emerald-950" disabled={!newMessage.trim() || submitting}>
                       {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                     </Button>
                   </div>
                 </form>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                 <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                   <MessageSquareIcon className="h-8 w-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground">Select a contact</h3>
                 <p className="text-sm text-muted-foreground mt-1 max-w-xs">Communicate with students and faculty members in real-time.</p>
                 <Button variant="outline" className="mt-6 md:hidden" onClick={() => setShowSidebarOnMobile(true)}>View Contacts</Button>
               </div>
             )}
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
