"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { LiveClass, User, UserRole } from "@/lib/types"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Hand,
  PhoneOff,
  Send,
  ChevronLeft,
  Settings,
  Maximize2,
  MoreVertical,
  Loader2,
} from "lucide-react"
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  useRoomContext,
  useLocalParticipant,
  ParticipantContext,
  VideoTrack,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import "@livekit/components-styles"

interface VideoRoomProps {
  liveClass: LiveClass
  currentUser: User
  backUrl: string
}

interface RoomMessage {
  id: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: Date
  isSystem?: boolean
}

export function VideoRoom({ liveClass, currentUser, backUrl }: VideoRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit/token?room=${liveClass.id}&username=${currentUser.name}`
        );
        const data = await resp.json();
        if (data.token) {
          setToken(data.token);
        } else {
          setError(data.error || "Failed to get token");
        }
      } catch (e) {
        setError("Connection error");
      }
    })();
  }, [liveClass.id, currentUser.name]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-foreground text-background p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Classroom Connection Error</h2>
        <p className="text-background/60 mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-foreground text-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-background/60 animate-pulse">Entering Classroom...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={() => (window.location.href = backUrl)}
      className="flex h-screen flex-col bg-foreground/95 relative overflow-hidden"
    >
      <VideoRoomContent liveClass={liveClass} backUrl={backUrl} currentUser={currentUser} />
    </LiveKitRoom>
  );
}

function VideoRoomContent({ liveClass, backUrl, currentUser }: VideoRoomProps) {
  const router = useRouter()
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant } = useLocalParticipant();
  const [screenSharing, setScreenSharing] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  const isTeacher = currentUser.role === "teacher"
  const participants = useParticipants();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { onlySubscribed: false });

  const [messages, setMessages] = useState<RoomMessage[]>([])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!messageInput.trim()) return
    const newMsg: RoomMessage = {
      id: `rm-${Date.now()}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: messageInput.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
    setMessageInput("")
  }

  const handleLeave = () => {
    router.push(backUrl)
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="flex h-screen flex-col bg-[#202124] text-white overflow-hidden font-sans">
      {/* Top Header - Floating Style */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="glass px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl">
             <div className="flex flex-col">
              <h1 className="text-sm font-medium tracking-tight whitespace-nowrap">
                {liveClass.title}
              </h1>
              <p className="text-[10px] text-white/50 leading-tight">
                {liveClass.courseName}
              </p>
            </div>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <div className="flex items-center gap-2">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-red-500">LIVE</span>
            </div>
          </div>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="glass px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium flex items-center gap-2 shadow-xl">
            <Users className="h-3.5 w-3.5 text-white/70" />
            <span>{participants.length}</span>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Video Grid */}
        <div className={cn(
          "flex-1 transition-all duration-500 ease-in-out p-4 md:p-6 lg:p-8 flex items-center justify-center",
          (chatOpen || participantsOpen) ? "mr-0 lg:mr-4" : ""
        )}>
          <div className={cn(
            "grid w-full h-full gap-4 max-w-7xl mx-auto",
            participants.length <= 1 ? "grid-cols-1" : 
            participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
            participants.length <= 4 ? "grid-cols-2" : 
            "grid-cols-2 lg:grid-cols-3"
          )}>
            {/* Local Participant */}
            <UserParticipantTile 
              participant={currentUser} 
              isTeacher={isTeacher}
              isLocal
              track={tracks.find(t => t.participant.identity === currentUser.name && t.source === Track.Source.Camera)}
            />

            {/* Remote Participants */}
            {participants.filter(p => p.identity !== currentUser.name).map(p => (
              <UserParticipantTile 
                key={p.sid}
                participant={{
                  id: p.sid,
                  name: p.identity || "Unknown",
                  avatar: (p.identity?.[0] || "?").toUpperCase(),
                  role: p.metadata?.includes('teacher') ? 'teacher' : 'student'
                } as User}
                isTeacher={p.metadata?.includes('teacher')}
                track={tracks.find(t => t.participant.sid === p.sid && t.source === Track.Source.Camera)}
              />
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <aside className={cn(
          "fixed right-0 top-0 bottom-0 z-30 w-full sm:w-80 md:w-96 glass-dark border-l border-white/10 transition-transform duration-500 ease-in-out transform shadow-2xl",
          (chatOpen || participantsOpen) ? "translate-x-0" : "translate-x-full"
        )}>
          {chatOpen && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-lg font-medium">In-call messages</h2>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="rounded-full hover:bg-white/10">
                  <PhoneOff className="h-5 w-5 rotate-135" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <p className="text-[11px] text-white/40 bg-white/5 p-3 rounded-lg text-center leading-relaxed">
                    Messages can only be seen by people in the call and are deleted when the call ends.
                  </p>
                  {messages.map((msg) => (
                    <div key={msg.id} className="group">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs font-semibold text-white/90">{msg.senderName}</span>
                        <span className="text-[10px] text-white/40">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed break-words">{msg.content}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="p-6 pt-2">
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                >
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Send a message to everyone"
                    className="pr-12 bg-white/5 border-none rounded-full h-12 text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 rounded-full hover:bg-primary/20 text-primary"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {participantsOpen && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-lg font-medium">People</h2>
                <Button variant="ghost" size="icon" onClick={() => setParticipantsOpen(false)} className="rounded-full hover:bg-white/10">
                  <PhoneOff className="h-5 w-5 rotate-135" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">In call</div>
                  {participants.map((p) => (
                    <div key={p.sid} className="flex items-center gap-4 group hover:bg-white/5 p-2 rounded-xl transition-colors">
                      <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                        <AvatarFallback className="bg-primary/20 text-primary font-medium">
                          {(p.identity?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white/90 truncate">{p.identity}</p>
                          {p.identity === currentUser.name && <span className="text-[10px] text-white/40">(You)</span>}
                        </div>
                        {p.metadata?.includes('teacher') && <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Instructor</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                           <MoreVertical className="h-4 w-4 text-white/40" />
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </aside>
      </div>

      {/* Floating Controls Bar - Google Meet Style */}
      <footer className="h-24 flex items-center justify-between px-6 relative z-40">
        <div className="hidden md:flex items-center gap-4 w-1/3">
           <span className="text-sm font-medium text-white/80">{formatTime(new Date())} | {liveClass.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <ControlButton
            active={isMicrophoneEnabled}
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            icon={isMicrophoneEnabled ? Mic : MicOff}
            label={isMicrophoneEnabled ? "Mute" : "Unmute"}
            danger={!isMicrophoneEnabled}
          />
          <ControlButton
            active={isCameraEnabled}
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
            icon={isCameraEnabled ? Video : VideoOff}
            label={isCameraEnabled ? "Stop Camera" : "Start Camera"}
            danger={!isCameraEnabled}
          />
          
          {isTeacher && (
            <ControlButton
              active={screenSharing}
              onClick={async () => {
                await localParticipant.setScreenShareEnabled(!screenSharing);
                setScreenSharing(!screenSharing);
              }}
              icon={screenSharing ? MonitorOff : Monitor}
              label={screenSharing ? "Stop Sharing" : "Share Screen"}
            />
          )}

          <ControlButton
            active={handRaised}
            onClick={() => setHandRaised(!handRaised)}
            icon={Hand}
            label="Raise hand"
            accent={handRaised}
          />

          <ControlButton
            active={false}
            onClick={() => {}}
            icon={MoreVertical}
            label="More options"
          />

          <Button
            onClick={handleLeave}
            className="h-12 px-6 rounded-full bg-red-500 hover:bg-red-600 border-none text-white shadow-xl flex items-center gap-2"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Leave</span>
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 w-1/3">
           <ControlButton
             active={participantsOpen}
             onClick={() => {
               setParticipantsOpen(!participantsOpen)
               setChatOpen(false)
             }}
             icon={Users}
             label="People"
             badge={participants.length}
           />
           <ControlButton
             active={chatOpen}
             onClick={() => {
               setChatOpen(!chatOpen)
               setParticipantsOpen(false)
             }}
             icon={MessageSquare}
             label="Chat"
             badge={messages.length > 0 ? messages.length : undefined}
           />
           <ControlButton
             active={false}
             onClick={() => {}}
             icon={Settings}
             label="Settings"
           />
        </div>
      </footer>
      
      <RoomAudioRenderer />
    </div>
  )
}

// ──────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────

function UserParticipantTile({
  participant,
  isTeacher,
  isLocal,
  track,
}: {
  participant: User | { id: string, name: string, avatar: string, role: string }
  isTeacher?: boolean
  isLocal?: boolean
  track?: any
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#3c4043] group transition-all duration-300 shadow-lg",
        "aspect-video w-full h-full"
      )}
    >
      {/* Real Video Track */}
      {track ? (
        <VideoTrack 
          trackRef={track} 
          className={cn(
            "w-full h-full object-cover",
            isLocal && "-scale-x-100"
          )}
        />
      ) : (
        /* Mock video placeholder / Avatar fallback */
        <div className="flex flex-col items-center justify-center w-full h-full transition-transform duration-500 group-hover:scale-110">
          <div className="flex items-center justify-center rounded-full bg-primary/10 w-20 h-20 md:w-24 md:h-24 border border-primary/20 shadow-inner">
            <span className="font-medium text-background text-2xl md:text-3xl tracking-tighter">
              {participant.avatar}
            </span>
          </div>
        </div>
      )}

      {/* Name and Indicators */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs font-medium shadow-lg max-w-[80%]">
          <span className="truncate">{participant.name}</span>
          {isLocal && <span className="text-white/40">(You)</span>}
          {isTeacher && (
             <Badge className="bg-primary/80 hover:bg-primary h-4 px-1 text-[9px] border-none">
               HOST
             </Badge>
          )}
        </div>
        <div className="h-8 w-8 rounded-full glass flex items-center justify-center shadow-lg">
          {track?.participant?.isMicrophoneEnabled ? (
            <Mic className="h-3.5 w-3.5 text-primary" />
          ) : (
            <MicOff className="h-3.5 w-3.5 text-white/40" />
          )}
        </div>
      </div>

      {/* Connection Quality */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-0.5 items-end h-3">
          <div className="w-0.5 h-1 bg-green-500 rounded-full" />
          <div className="w-0.5 h-2 bg-green-500 rounded-full" />
          <div className="w-0.5 h-3 bg-green-500 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function ControlButton({
  active,
  onClick,
  icon: Icon,
  label,
  accent,
  danger,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  accent?: boolean
  danger?: boolean
  badge?: number
}) {
  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full transition-all duration-300",
          danger 
            ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
            : accent
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : active
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
        )}
        onClick={onClick}
        aria-label={label}
      >
        <Icon className={cn("h-5 w-5", active && !danger && !accent && "text-white")} />
      </Button>
      {badge !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-lg">
          {badge}
        </span>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    </div>
  )
}

function ParticipantListItem({
  participantName,
  isTeacher,
  isCurrentUser,
}: {
  participantName: string
  isTeacher?: boolean
  isCurrentUser: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/20 text-[10px] text-primary">
          {participantName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-xs font-medium text-white/90">
          {participantName}
          {isCurrentUser && (
            <span className="ml-1 text-white/40">(You)</span>
          )}
        </p>
        {isTeacher && (
          <p className="text-[9px] text-primary font-bold uppercase">Instructor</p>
        )}
      </div>
      <MicOff className="h-3.5 w-3.5 text-white/20" />
    </div>
  )
}
