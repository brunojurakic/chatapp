import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import type { Message, Participant, TypingEvent } from "@/types/chat"
import { ChatWebSocketManager, fetchChatData } from "@/utils/websocket"
import { useTypingIndicator } from "@/hooks/useTypingIndicator"

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
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false)

  const wsManagerRef = useRef<ChatWebSocketManager | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const didInitialScrollRef = useRef(false)

  const handleMessageReceived = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const handleTypingEvent = useCallback(
    (event: TypingEvent) => {
      if (event.type === "typing" && event.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          if (event.isTyping) {
            newSet.add(event.userId)
          } else {
            newSet.delete(event.userId)
          }
          return newSet
        })
      }
    },
    [currentUserId],
  )

  const handleConnectionChange = useCallback((isConnected: boolean) => {
    setConnected(isConnected)
  }, [])

  const handleError = useCallback((error: string) => {
    toast.error(error)
  }, [])

  const { handleInputChange: handleTypingInputChange, stopTyping } =
    useTypingIndicator({
      onSendTyping: (isTyping: boolean) => {
        setIsCurrentUserTyping(isTyping)
        wsManagerRef.current?.sendTypingIndicator(isTyping)
      },
    })

  const handleInputChange = (value: string) => {
    setInput(value)
    handleTypingInputChange(value)
  }

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem("jwt_token")
    if (!token) return

    fetchChatData(conversationId, token).then(({ messages, participant }) => {
      if (!mounted) return
      setMessages(messages)
      setParticipant(participant)
    })

    wsManagerRef.current = new ChatWebSocketManager(conversationId, token, {
      onMessageReceived: handleMessageReceived,
      onTypingEvent: handleTypingEvent,
      onConnectionChange: handleConnectionChange,
      onError: handleError,
    })

    wsManagerRef.current.connect()

    return () => {
      mounted = false
      wsManagerRef.current?.disconnect()
    }
  }, [
    conversationId,
    currentUserId,
    handleMessageReceived,
    handleTypingEvent,
    handleConnectionChange,
    handleError,
  ])

  const retryConnect = () => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      toast.error("Not authenticated")
      return
    }

    if (wsManagerRef.current) {
      wsManagerRef.current.connect()
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
      const success = await wsManagerRef.current?.sendMessage(input.trim())
      if (!success) {
        toast.error("Could not send message")
        return
      }

      stopTyping()
      setIsCurrentUserTyping(false)
      setInput("")
    } catch (err) {
      console.warn(err)
      toast.error("Could not send message")
    } finally {
      setSendLoading(false)
    }
  }

  const uploadFile = async (file: File) => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      toast.error("Not authenticated")
      return
    }

    const form = new FormData()
    form.append("file", file)
    form.append("content", "")

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${conversationId}/upload`,
        {
          method: "POST",
          body: form,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error || "Upload failed")
        return
      }

      const msg = await res.json()
      setMessages((prev) => [...prev, msg])
    } catch (err) {
      console.warn(err)
      toast.error("Upload failed")
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
          isTyping={typingUsers.size > 0 && !isCurrentUserTyping}
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
          onFileSelected={uploadFile}
        />
      </div>
    </div>
  )
}
