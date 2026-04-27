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
  ParticipantTile as LiveKitParticipantTile,
  ParticipantContext,
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
  const [fullscreenParticipant, setFullscreenParticipant] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const isTeacher = currentUser.role === "teacher"
  const participants = useParticipants();


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

  // Determine which participant is "speaking" (mock: teacher)
  const speakerId = liveClass.teacherId

  return (
    <div className="flex h-screen flex-col bg-foreground/95 relative overflow-hidden">
      {/* Subtle Atmospheric Glows */}
      <div className="absolute top-24 left-[-5%] w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-24 right-[-5%] w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none z-0" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-foreground/10 glass border-x-0 border-t-0 shadow-none px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-background/70 hover:bg-foreground/10 hover:text-background"
            onClick={handleLeave}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-background">
              {liveClass.title}
            </h1>
            <p className="text-xs text-background/50">
              {liveClass.courseName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-destructive text-destructive-foreground">
            LIVE
          </Badge>
          <span className="text-xs text-background/50">
            {participants.length} participants
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Video grid container */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-3 relative">
            {/* Real LiveKit Track Rendering */}
            <VideoConference />
            
            {/* Custom tiles can still be used if we want a specific look, 
                but VideoConference handles the grid and tracks automatically */}
            <RoomAudioRenderer />
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-center gap-2 border-t border-foreground/10 glass border-x-0 border-b-0 shadow-none px-4 py-3">
            <ControlButton
              active={isMicrophoneEnabled}
              onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
              icon={isMicrophoneEnabled ? Mic : MicOff}
              label={isMicrophoneEnabled ? "Mute" : "Unmute"}
            />
            <ControlButton
              active={isCameraEnabled}
              onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
              icon={isCameraEnabled ? Video : VideoOff}
              label={isCameraEnabled ? "Stop Camera" : "Start Camera"}
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
                accent
              />
            )}
            <ControlButton
              active={handRaised}
              onClick={() => {
                setHandRaised(!handRaised);
                // In real LiveKit, you would send a data message here
              }}
              icon={Hand}
              label={handRaised ? "Lower Hand" : "Raise Hand"}
              accent={handRaised}
            />

            <div className="mx-2 h-8 w-px bg-background/10" />

            <ControlButton
              active={chatOpen}
              onClick={() => {
                setChatOpen(!chatOpen)
                if (!chatOpen) setParticipantsOpen(false)
              }}
              icon={MessageSquare}
              label="Chat"
              badge={!chatOpen ? messages.length : undefined}
            />
            <ControlButton
              active={participantsOpen}
              onClick={() => {
                setParticipantsOpen(!participantsOpen)
                if (!participantsOpen) setChatOpen(false)
              }}
              icon={Users}
              label="Participants"
              badge={participants.length}
            />

            <div className="mx-2 h-8 w-px bg-background/10" />

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
              onClick={handleLeave}
              aria-label="Leave class"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Side panel (chat or participants) */}
        {(chatOpen || participantsOpen) && (
          <aside className="flex w-80 flex-col border-l border-foreground/10 glass border-y-0 border-r-0 shadow-none">
            {chatOpen && (
              <>
                <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-background">
                    In-class Chat
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/50 hover:text-background"
                    onClick={() => setChatOpen(false)}
                  >
                    Close
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) =>
                      msg.isSystem ? (
                        <p
                          key={msg.id}
                          className="text-center text-xs text-background/40"
                        >
                          {msg.content}
                        </p>
                      ) : (
                        <div key={msg.id} className="flex gap-2">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-primary/30 text-[10px] text-background">
                              {msg.senderAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-medium text-background/80">
                                {msg.senderName}
                              </span>
                              <span className="text-[10px] text-background/30">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-background/60">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <form
                  className="flex gap-2 border-t border-foreground/10 p-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                >
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border-foreground/20 bg-foreground/50 text-xs text-background placeholder:text-background/30 focus-visible:ring-primary"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}

            {participantsOpen && (
              <>
                <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
                  <h2 className="text-sm font-semibold text-background">
                    Participants ({participants.length})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-background/50 hover:text-background"
                    onClick={() => setParticipantsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {participants
                      .map((p) => {
                        const isHost = p.identity === liveClass.teacherName || p.metadata?.includes('teacher');
                        return (
                          <ParticipantListItem
                            key={p.sid}
                            participantName={p.identity || "Unknown"}
                            isTeacher={isHost}
                            isCurrentUser={p.identity === currentUser.name}
                          />
                        );
                      })}
                  </div>
                </ScrollArea>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────

function ParticipantTile({
  participant,
  isSpeaking,
  isTeacher,
  isScreenSharing,
  large,
  onDoubleClick,
}: {
  participant: User
  isSpeaking: boolean
  isTeacher: boolean
  isScreenSharing?: boolean
  large?: boolean
  onDoubleClick?: () => void
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-foreground/60",
        isSpeaking && "ring-2 ring-primary",
        large ? "h-full" : "min-h-[120px]"
      )}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
      aria-label={`${participant.name}'s video`}
    >
      {/* Mock video placeholder */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary/20",
            large ? "h-24 w-24" : "h-16 w-16"
          )}
        >
          <span
            className={cn(
              "font-semibold text-background",
              large ? "text-2xl" : "text-lg"
            )}
          >
            {participant.avatar}
          </span>
        </div>
        {isScreenSharing && (
          <Badge
            variant="secondary"
            className="bg-primary/80 text-[10px] text-primary-foreground"
          >
            Sharing Screen
          </Badge>
        )}
      </div>

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-foreground/70 px-2 py-1">
        <span className="text-xs font-medium text-background">
          {participant.name}
        </span>
        {isTeacher && (
          <Badge
            variant="secondary"
            className="h-4 bg-primary/70 px-1 text-[9px] text-primary-foreground"
          >
            Host
          </Badge>
        )}
      </div>

      {/* Mic indicator */}
      <div className="absolute bottom-2 right-2">
        <Mic className="h-3.5 w-3.5 text-background/50" />
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
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  accent?: boolean
  badge?: number
}) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full",
          active && accent
            ? "bg-primary text-primary-foreground hover:bg-primary/80"
            : active
              ? "bg-background/10 text-background hover:bg-background/20"
              : "bg-background/5 text-background/50 hover:bg-background/10 hover:text-background"
        )}
        onClick={onClick}
        aria-label={label}
        title={label}
      >
        <Icon className="h-5 w-5" />
      </Button>
      {badge !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
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
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-foreground/10">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/20 text-[10px] text-background">
          {participantName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-xs font-medium text-background">
          {participantName}
          {isCurrentUser && (
            <span className="ml-1 text-background/40">(You)</span>
          )}
        </p>
        {isTeacher && (
          <p className="text-[10px] text-primary">Instructor</p>
        )}
      </div>
      <Mic className="h-3.5 w-3.5 text-background/40" />
    </div>
  )
}
