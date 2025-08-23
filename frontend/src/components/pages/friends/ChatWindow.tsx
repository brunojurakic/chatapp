import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Send, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

interface Message {
  id: string
  friendshipId: string
  senderId: string
  senderName: string
  senderPicture?: string
  content: string
  createdAt: string
}

export function ChatRoom({ conversationId }: { conversationId: string }) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? null
  const currentUsername = user?.username ?? null
  const currentDisplayName = user?.displayName ?? user?.name ?? null
  const [messages, setMessages] = useState<Message[]>([])
  const [participant, setParticipant] = useState<{
    id: string
    username: string
    name: string
    picture?: string
  } | null>(null)
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const subRef = useRef<unknown>(null)
  const typingSubRef = useRef<unknown>(null)
  const connectResolversRef = useRef<Array<(ok: boolean) => void>>([])
  const [sendLoading, setSendLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const didInitialScrollRef = useRef(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem("jwt_token")
    if (!token) return

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/chats/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setMessages(Array.isArray(data) ? data.reverse() : [])
      })
      .catch((err) => console.warn("Failed to fetch history", err))

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/chats/${conversationId}/participant`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((r) => r.json())
      .then((data) => setParticipant(data))
      .catch(() => setParticipant(null))

    const createClient = () => {
      console.debug("Creating stomp client for conversation", conversationId)
      const sock = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`)

      const client = new Client({
        webSocketFactory: () => sock,
        debug: (m: string) => console.debug("stomp:", m),
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          console.info("STOMP connected")
          setConnected(true)
          try {
            connectResolversRef.current.forEach((r) => r(true))
            connectResolversRef.current = []
          } catch (err) {
            console.warn(err)
          }
          try {
            subRef.current = client.subscribe(
              `/topic/chats/${conversationId}`,
              (msg) => {
                try {
                  const body = JSON.parse(msg.body)
                  setMessages((s) => [...s, body])
                } catch (err) {
                  console.warn("Failed to parse stomp message", err)
                }
              },
            )

            typingSubRef.current = client.subscribe(
              `/topic/chats/${conversationId}/typing`,
              (msg) => {
                try {
                  const typingEvent = JSON.parse(msg.body)
                  if (
                    typingEvent.type === "typing" &&
                    typingEvent.userId !== currentUserId
                  ) {
                    setTypingUsers((prev) => {
                      const newSet = new Set(prev)
                      if (typingEvent.isTyping) {
                        newSet.add(typingEvent.userId)
                      } else {
                        newSet.delete(typingEvent.userId)
                      }
                      return newSet
                    })
                  }
                } catch (err) {
                  console.warn("Failed to parse typing indicator", err)
                }
              },
            )
          } catch (err) {
            console.warn("Subscribe failed", err)
          }
        },
        onStompError: (frame) => {
          console.error("STOMP error", frame)
          toast.error(frame.body || "WebSocket error")
        },
        onWebSocketError: (evt) => {
          console.error("WebSocket error event", evt)
        },
        onDisconnect: () => {
          console.info("STOMP disconnected")
          setConnected(false)
        },
      })
      client.activate()
      clientRef.current = client
      return client
    }

    const client = createClient()

    return () => {
      mounted = false
      try {
        ;(subRef.current as { unsubscribe?: () => void })?.unsubscribe?.()
      } catch (err) {
        console.warn(err)
      }
      try {
        ;(typingSubRef.current as { unsubscribe?: () => void })?.unsubscribe?.()
      } catch (err) {
        console.warn(err)
      }
      try {
        client.deactivate()
      } catch (err) {
        console.warn(err)
      }
    }
  }, [conversationId, currentUserId])

  const retryConnect = () => {
    try {
      console.info("Retrying STOMP connection...")
      try {
        clientRef.current?.deactivate()
      } catch {
        /* ignore */
      }
      const token = localStorage.getItem("jwt_token")
      if (!token) return toast.error("Not authenticated")
      const sock = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`)
      const client = new Client({
        webSocketFactory: () => sock,
        debug: (m: string) => console.debug("stomp:", m),
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          console.info("STOMP reconnected")
          setConnected(true)
          try {
            connectResolversRef.current.forEach((r) => r(true))
            connectResolversRef.current = []
          } catch (err) {
            console.warn(err)
          }
          try {
            type StompMsg = { body: string }
            ;(
              client as {
                subscribe: (d: string, cb: (m: StompMsg) => void) => void
              }
            ).subscribe(`/topic/chats/${conversationId}`, (msg) => {
              try {
                setMessages((s) => [...s, JSON.parse(msg.body)])
              } catch (err) {
                console.warn(err)
              }
            })
            ;(
              client as {
                subscribe: (d: string, cb: (m: StompMsg) => void) => void
              }
            ).subscribe(`/topic/chats/${conversationId}/typing`, (msg) => {
              try {
                const typingEvent = JSON.parse(msg.body)
                if (
                  typingEvent.type === "typing" &&
                  typingEvent.userId !== currentUserId
                ) {
                  setTypingUsers((prev) => {
                    const newSet = new Set(prev)
                    if (typingEvent.isTyping) {
                      newSet.add(typingEvent.userId)
                    } else {
                      newSet.delete(typingEvent.userId)
                    }
                    return newSet
                  })
                }
              } catch (err) {
                console.warn("Failed to parse typing indicator", err)
              }
            })
          } catch (err) {
            console.warn(err)
          }
        },
        onStompError: (frame) => {
          console.error(frame)
          toast.error(frame.body || "WebSocket error")
        },
      })
      client.activate()
      clientRef.current = client
    } catch (err) {
      console.warn("Retry failed", err)
      toast.error("Could not reconnect")
    }
  }

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!connected || !clientRef.current) return

    try {
      clientRef.current.publish({
        destination: `/app/chats/${conversationId}/typing`,
        body: isTyping.toString(),
      })
    } catch (err) {
      console.warn("Failed to send typing indicator", err)
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)

    if (value.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true
        sendTypingIndicator(true)
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
        sendTypingIndicator(false)
      }, 3000)
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false
        sendTypingIndicator(false)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const send = async () => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      toast.error("Not authenticated")
      return
    }
    if (!input.trim()) return
    setSendLoading(true)
    try {
      if (!connected) {
        const ok = await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => {
            connectResolversRef.current = connectResolversRef.current.filter(
              (r) => r !== resolver,
            )
            resolve(false)
          }, 7000)
          const resolver = (v: boolean) => {
            clearTimeout(timer)
            resolve(v)
          }
          connectResolversRef.current.push(resolver)
          try {
            retryConnect()
          } catch (e) {
            console.warn("retryConnect failed", e)
          }
        })
        if (!ok) {
          toast.error("Could not reconnect")
          return
        }
      }

      clientRef.current?.publish({
        destination: `/app/chats/${conversationId}/send`,
        body: input.trim(),
      })

      if (isTypingRef.current) {
        isTypingRef.current = false
        sendTypingIndicator(false)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      setInput("")
    } catch (err) {
      console.warn(err)
      toast.error("Could not send message")
    } finally {
      setSendLoading(false)
    }
  }

  useLayoutEffect(() => {
    const c = scrollContainerRef.current
    if (!c) return
    const behavior = didInitialScrollRef.current
      ? ("smooth" as const)
      : ("auto" as const)
    c.scrollTo({ top: c.scrollHeight, behavior })
    didInitialScrollRef.current = true
  }, [messages.length])

  return (
    <div className="h-full w-full bg-background dark:bg-black">
      <div className="flex h-full w-full flex-col border-0 rounded-none bg-transparent py-0 gap-0">
        <div className="flex items-center justify-between border-b px-6 py-3 bg-background/70 dark:bg-black">
          <div className="flex items-center gap-3">
            {participant ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {participant.picture ? (
                    <AvatarImage
                      src={participant.picture}
                      alt={participant.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-muted text-foreground/80 text-xs">
                    {participant.name
                      ?.split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <div className="text-sm font-medium">{participant.name}</div>
                  <div className="text-xs text-muted-foreground">
                    @{participant.username}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-base font-semibold">Direct Messages</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {typingUsers.size > 0 && !isTypingRef.current && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center space-x-1">
                  <div
                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  typing
                </span>
              </div>
            )}

            <Badge variant={connected ? "default" : "destructive"}>
              {connected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="ml-1">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </Badge>
            {!connected ? (
              <Button size="sm" variant="outline" onClick={retryConnect}>
                Reconnect
              </Button>
            ) : null}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 bg-background dark:bg-black"
        >
          <div className="mx-auto max-w-3xl">
            {messages.map((m, i) => {
              const isMe =
                (currentUserId && m.senderId === currentUserId) ||
                (currentDisplayName && m.senderName === currentDisplayName) ||
                (currentUsername && m.senderName === currentUsername) ||
                false

              const prev = messages[i - 1]
              const prevTime = prev ? Date.parse(prev.createdAt) : 0
              const curTime = Date.parse(m.createdAt)
              const isFirstInGroup =
                i === 0 ||
                prev.senderId !== m.senderId ||
                curTime - prevTime > 60_000

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 first:mt-0 ${isMe ? "flex-row-reverse" : ""} ${isFirstInGroup ? "mt-2" : "mt-0.5"}`}
                >
                  {isFirstInGroup ? (
                    <Avatar className="h-9 w-9 border-1 flex-shrink-0">
                      {m.senderPicture ? (
                        <AvatarImage
                          src={m.senderPicture}
                          alt={m.senderName}
                          className="h-9 w-9 rounded-full object-cover"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <AvatarFallback className="bg-muted text-foreground/80 text-xs">
                        {m.senderName
                          ?.split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div aria-hidden className="h-9 w-9 flex-shrink-0" />
                  )}

                  <div
                    className={`min-w-0 flex-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {isFirstInGroup ? (
                      <div
                        className={`flex items-baseline gap-2 mb-1 ${isMe ? "justify-end" : ""}`}
                      >
                        {isMe ? (
                          <>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(m.createdAt).toLocaleString()}
                            </div>
                            <div className="truncate text-sm font-medium">
                              {m.senderName}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="truncate text-sm font-medium">
                              {m.senderName}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(m.createdAt).toLocaleString()}
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}

                    <div
                      className={
                        `block max-w-[min(100%,72ch)] rounded-md px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ` +
                        (isMe
                          ? "bg-emerald-100 text-slate-900 dark:bg-emerald-950 dark:text-slate-100 text-right"
                          : "bg-zinc-200 dark:bg-neutral-900 text-foreground text-left")
                      }
                      role="article"
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Message"
              className="flex-1"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <Button
              onClick={send}
              disabled={sendLoading || input.trim() === ""}
              className="shrink-0"
            >
              {sendLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
