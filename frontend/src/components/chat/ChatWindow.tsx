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
import { tokenUtils, apiUtils } from "@/utils/apiUtils"

export function ChatRoom({ conversationId }: { conversationId: string }) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? null
  const currentUsername = user?.username ?? null
  const currentDisplayName = user?.displayName ?? user?.name ?? null

  const [messages, setMessages] = useState<Message[]>([])
  const [searchResults, setSearchResults] = useState<Message[] | null>(null)
  const [matchesCount, setMatchesCount] = useState<number>(0)
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
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

  const searchMessages = async (q: string) => {
    if (!tokenUtils.exists()) {
      toast.error("Not authenticated")
      return
    }

    try {
      const res = await apiUtils.get(
        `/api/chats/${conversationId}/search?q=${encodeURIComponent(q)}`,
      )

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error || "Search failed")
        return
      }

      const data = await res.json()
      const newMatchedIds: string[] = (data.matchedIds ?? []).map(
        (id: string) => id,
      )
      setSearchResults(data.messages)
      setMatchesCount(data.matchesCount ?? 0)
      setMatchedIds(newMatchedIds)
      setSearchQuery(q)

      if (newMatchedIds.length > 0) {
        const sameAsBefore =
          matchedIds.length === newMatchedIds.length &&
          matchedIds.every((v, i) => v === newMatchedIds[i])

        if (sameAsBefore) {
          if (
            currentMatchIndex < 0 ||
            currentMatchIndex >= newMatchedIds.length
          ) {
            setCurrentMatchIndex(0)
            setTimeout(() => {
              const el = document.getElementById(`message-${newMatchedIds[0]}`)
              el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 150)
          }
        } else {
          setCurrentMatchIndex(0)
          setTimeout(() => {
            const el = document.getElementById(`message-${newMatchedIds[0]}`)
            el?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 150)
        }
      } else {
        setCurrentMatchIndex(-1)
      }
    } catch (err) {
      console.warn(err)
      toast.error("Search failed")
    }
  }

  const clearSearchAll = () => {
    setSearchResults(null)
    setSearchQuery(null)
    setMatchesCount(0)
    setMatchedIds([])
    setCurrentMatchIndex(-1)
  }

  const goToMatch = (indexDelta: number) => {
    if (!matchedIds || matchedIds.length === 0) return
    let next = currentMatchIndex + indexDelta
    if (next < 0) next = matchedIds.length - 1
    if (next >= matchedIds.length) next = 0
    setCurrentMatchIndex(next)
    const id = matchedIds[next]
    const el = document.getElementById(`message-${id}`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const retryConnect = () => {
    if (!tokenUtils.exists()) {
      toast.error("Not authenticated")
      return
    }

    if (wsManagerRef.current) {
      wsManagerRef.current.connect()
    }
  }

  const send = async () => {
    if (!tokenUtils.exists()) {
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
    if (!tokenUtils.exists()) {
      toast.error("Not authenticated")
      return
    }

    const form = new FormData()
    form.append("file", file)
    form.append("content", "")

    setUploadLoading(true)
    try {
      const res = await apiUtils.authenticatedRequest(
        `/api/chats/${conversationId}/upload`,
        {
          method: "POST",
          body: form,
        },
      )

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error || "Upload failed")
        return
      }

      const msg = await res.json()
      if (!connected) {
        setMessages((prev) => [...prev, msg])
      }
      toast.success("File uploaded successfully")
    } catch (err) {
      console.warn(err)
      toast.error("Upload failed")
    } finally {
      setUploadLoading(false)
    }
  }

  useLayoutEffect(() => {
    if (searchResults) return

    const c = scrollContainerRef.current
    if (!c) return
    const behavior = didInitialScrollRef.current
      ? ("smooth" as const)
      : ("auto" as const)
    c.scrollTo({ top: c.scrollHeight, behavior })
    didInitialScrollRef.current = true
  }, [messages.length, searchResults])

  return (
    <div className="h-full w-full bg-background dark:bg-background">
      <div className="flex h-full w-full flex-col border-0 rounded-none bg-transparent py-0 gap-0">
        <ChatHeader
          participant={participant}
          connected={connected}
          isTyping={typingUsers.size > 0 && !isCurrentUserTyping}
          onRetryConnect={retryConnect}
          onSearch={searchMessages}
          onClearSearch={clearSearchAll}
          onPrevMatch={() => goToMatch(-1)}
          onNextMatch={() => goToMatch(1)}
          matchesCount={matchesCount}
          currentMatchIndex={currentMatchIndex}
        />
        <MessageList
          ref={scrollContainerRef}
          messages={searchResults ?? messages}
          highlightQuery={searchQuery ?? undefined}
          currentUserId={currentUserId}
          currentDisplayName={currentDisplayName}
          currentUsername={currentUsername}
        />

        <ChatInput
          input={input}
          sendLoading={sendLoading}
          uploadLoading={uploadLoading}
          onInputChange={handleInputChange}
          onSend={send}
          onFileSelected={uploadFile}
        />
      </div>
    </div>
  )
}
