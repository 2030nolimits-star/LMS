"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  getConversations, 
  getMessages, 
  sendMessage 
} from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import { useEffect, useRef } from "react"

export default function TeacherChatPage() {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentUser) return;
    loadConversations();

    const channel = supabase
      .channel('teacher_realtime_chats')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.sender_id === selectedConv || newMsg.receiver_id === selectedConv) {
          setMessages(prev => [...prev, newMsg]);
        }
        loadConversations();
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser, selectedConv])

  useEffect(() => {
    if (selectedConv && currentUser) {
      getMessages(currentUser.id, selectedConv).then(setMessages);
    }
  }, [selectedConv, currentUser])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages])

  async function loadConversations() {
    if (!currentUser) return;
    const data = await getConversations(currentUser.id);
    setConversations(data);
    setLoading(false);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConv || !currentUser) return;

    const content = messageInput;
    setMessageInput("");
    try {
      await sendMessage(currentUser.id, selectedConv, content);
    } catch (error) {
      console.error("Send error:", error);
    }
  }

  if (!currentUser) return null

  const filteredConvs = conversations.filter((c) =>
    c.other.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConvData = conversations.find((c) => c.id === selectedConv)
  const otherParticipant = selectedConvData?.other


  return (
    <DashboardShell role="teacher">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your students.
          </p>
        </div>

        <Card className="flex h-[calc(100vh-14rem)] overflow-hidden border-border/50">
          <div
            className={cn(
              "flex w-full flex-col border-r border-border md:w-80",
              selectedConv && "hidden md:flex"
            )}
          >
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredConvs.map((conv) => {
                const other = conv.participants.find(
                  (p: any) => p.id !== currentUser.id
                )
                if (!other) return null
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border/50 p-3 text-left transition-colors hover:bg-muted/50",
                      selectedConv === conv.id && "bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {other.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {other.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge className="h-5 min-w-[20px] px-1.5 text-[10px]">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                )
              })}
            </ScrollArea>
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col",
              !selectedConv && "hidden md:flex"
            )}
          >
            {selectedConv && otherParticipant ? (
              <>
                <div className="flex items-center gap-3 border-b border-border p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConv(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {otherParticipant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {otherParticipant.name}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {otherParticipant.role}
                    </p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser.id
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex max-w-[75%] flex-col",
                            isMe ? "ml-auto items-end" : "items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-xl px-3 py-2 text-sm",
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            {msg.content}
                          </div>
                          <span className="mt-0.5 text-[10px] text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                      )
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="border-t border-border p-3">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
