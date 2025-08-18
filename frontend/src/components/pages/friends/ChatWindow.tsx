import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const subRef = useRef<unknown>(null)

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(subRef.current as any)?.unsubscribe?.()
      } catch (err) {
        console.warn(err)
      }
      try {
        client.deactivate()
      } catch (err) {
        console.warn(err)
      }
    }
  }, [conversationId])

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

  const send = () => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      toast.error("Not authenticated")
      return
    }
    if (!input.trim()) return
    try {
      clientRef.current?.publish({
        destination: `/app/chats/${conversationId}/send`,
        body: input.trim(),
      })
      setInput("")
    } catch (err) {
      console.warn(err)
      toast.error("Could not send message")
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chat</CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={`text-xs font-medium ${connected ? "text-emerald-600" : "text-rose-600"}`}
            >
              {connected ? "Connected" : "Disconnected"}
            </div>
            {!connected ? (
              <Button size="sm" variant="outline" onClick={retryConnect}>
                Retry
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-y-auto space-y-2 p-2 border rounded bg-surface">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                {m.senderPicture ? (
                  <img
                    src={m.senderPicture}
                    alt={m.senderName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {m.senderName
                      ?.split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="text-sm font-medium">{m.senderName}</div>
                <div className="text-sm">{m.content}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
            placeholder="Type a message"
            onKeyDown={(e) => {
              if (e.key === "Enter") send()
            }}
          />
          <Button onClick={send} disabled={!connected}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}