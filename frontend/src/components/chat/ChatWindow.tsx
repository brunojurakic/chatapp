import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"

interface Message {
  id: string
  friendshipId: string
  senderId: string
  senderName: string
  senderPicture?: string
  content: string
  createdAt: string
}

interface Participant {
  id: string
  username: string
  name: string
  picture?: string
}

export function ChatRoom({ conversationId }: { conversationId: string }) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? null
  const currentUsername = user?.username ?? null
  const currentDisplayName = user?.displayName ?? user?.name ?? null

  const [messages, setMessages] = useState<Message[]>([])
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const clientRef = useRef<Client | null>(null)
  const subRef = useRef<unknown>(null)
  const typingSubRef = useRef<unknown>(null)
  const connectResolversRef = useRef<Array<(ok: boolean) => void>>([])
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const didInitialScrollRef = useRef(false)
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

    const currentSub = subRef
    const currentTypingSub = typingSubRef

    return () => {
      mounted = false
      try {
        ;(currentSub.current as { unsubscribe?: () => void })?.unsubscribe?.()
      } catch (err) {
        console.warn(err)
      }
      try {
        ;(
          currentTypingSub.current as { unsubscribe?: () => void }
        )?.unsubscribe?.()
      } catch (err) {
        console.warn(err)
      }
      try {
        client?.deactivate()
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
        <ChatHeader
          participant={participant}
          connected={connected}
          isTyping={typingUsers.size > 0 && !isTypingRef.current}
          onRetryConnect={retryConnect}
        />

        <MessageList
          ref={scrollContainerRef}
          messages={messages}
          currentUserId={currentUserId}
          currentDisplayName={currentDisplayName}
          currentUsername={currentUsername}
        />

        <ChatInput
          input={input}
          sendLoading={sendLoading}
          onInputChange={handleInputChange}
          onSend={send}
        />
      </div>
    </div>
  )
}
