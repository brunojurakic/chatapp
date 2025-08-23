import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { toast } from "sonner"
import type { Message, TypingEvent } from "@/types/chat"

export interface WebSocketCallbacks {
  onMessageReceived: (message: Message) => void
  onTypingEvent: (event: TypingEvent) => void
  onConnectionChange: (connected: boolean) => void
  onError: (error: string) => void
}

interface StompSubscription {
  unsubscribe: () => void
}

export class ChatWebSocketManager {
  private client: Client | null = null
  private messageSubscription: StompSubscription | null = null
  private typingSubscription: StompSubscription | null = null
  private conversationId: string
  private token: string
  private callbacks: WebSocketCallbacks
  private connectResolvers: Array<(ok: boolean) => void> = []

  constructor(
    conversationId: string,
    token: string,
    callbacks: WebSocketCallbacks,
  ) {
    this.conversationId = conversationId
    this.token = token
    this.callbacks = callbacks
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        console.debug(
          "Creating STOMP client for conversation",
          this.conversationId,
        )

        const sock = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`)

        this.client = new Client({
          webSocketFactory: () => sock,
          debug: (m: string) => console.debug("stomp:", m),
          connectHeaders: { Authorization: `Bearer ${this.token}` },
          onConnect: () => {
            console.info("STOMP connected")
            this.callbacks.onConnectionChange(true)

            this.connectResolvers.forEach((r) => r(true))
            this.connectResolvers = []

            this.setupSubscriptions()
            resolve(true)
          },
          onStompError: (frame) => {
            console.error("STOMP error", frame)
            const errorMsg = frame.body || "WebSocket error"
            this.callbacks.onError(errorMsg)
            toast.error(errorMsg)
            resolve(false)
          },
          onWebSocketError: (evt) => {
            console.error("WebSocket error event", evt)
            resolve(false)
          },
          onDisconnect: () => {
            console.info("STOMP disconnected")
            this.callbacks.onConnectionChange(false)
          },
        })

        this.client.activate()
      } catch (error) {
        console.error("Failed to create WebSocket connection", error)
        resolve(false)
      }
    })
  }

  private setupSubscriptions() {
    if (!this.client) return

    try {
      this.messageSubscription = this.client.subscribe(
        `/topic/chats/${this.conversationId}`,
        (msg) => {
          try {
            const message = JSON.parse(msg.body) as Message
            this.callbacks.onMessageReceived(message)
          } catch (err) {
            console.warn("Failed to parse message", err)
          }
        },
      )

      this.typingSubscription = this.client.subscribe(
        `/topic/chats/${this.conversationId}/typing`,
        (msg) => {
          try {
            const typingEvent = JSON.parse(msg.body) as TypingEvent
            this.callbacks.onTypingEvent(typingEvent)
          } catch (err) {
            console.warn("Failed to parse typing indicator", err)
          }
        },
      )
    } catch (error) {
      console.warn("Subscribe failed", error)
    }
  }

  disconnect() {
    try {
      this.messageSubscription?.unsubscribe()
      this.typingSubscription?.unsubscribe()
      this.client?.deactivate()
    } catch (error) {
      console.warn("Error during disconnect", error)
    }
  }

  sendMessage(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.client || !this.client.connected) {
        const connectPromise = new Promise<boolean>((connectResolve) => {
          const timer = setTimeout(() => {
            this.connectResolvers = this.connectResolvers.filter(
              (r) => r !== connectResolve,
            )
            connectResolve(false)
          }, 7000)

          const resolver = (success: boolean) => {
            clearTimeout(timer)
            connectResolve(success)
          }

          this.connectResolvers.push(resolver)
          this.connect()
        })

        connectPromise.then((connected) => {
          if (connected) {
            this.publishMessage(message, resolve)
          } else {
            resolve(false)
          }
        })
      } else {
        this.publishMessage(message, resolve)
      }
    })
  }

  private publishMessage(message: string, resolve: (success: boolean) => void) {
    try {
      this.client?.publish({
        destination: `/app/chats/${this.conversationId}/send`,
        body: message.trim(),
      })
      resolve(true)
    } catch (error) {
      console.warn("Failed to send message", error)
      resolve(false)
    }
  }

  sendTypingIndicator(isTyping: boolean) {
    if (!this.client || !this.client.connected) return

    try {
      this.client.publish({
        destination: `/app/chats/${this.conversationId}/typing`,
        body: isTyping.toString(),
      })
    } catch (error) {
      console.warn("Failed to send typing indicator", error)
    }
  }

  async waitForConnection(timeoutMs: number = 7000): Promise<boolean> {
    if (this.client?.connected) return true

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.connectResolvers = this.connectResolvers.filter(
          (r) => r !== resolve,
        )
        resolve(false)
      }, timeoutMs)

      const resolver = (success: boolean) => {
        clearTimeout(timer)
        resolve(success)
      }

      this.connectResolvers.push(resolver)
    })
  }
}

export const fetchChatData = async (conversationId: string, token: string) => {
  try {
    const [messagesResponse, participantResponse] = await Promise.all([
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${conversationId}/participant`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
    ])

    const messages = await messagesResponse.json()
    const participant = await participantResponse.json()

    return {
      messages: Array.isArray(messages) ? messages.reverse() : [],
      participant: participantResponse.ok ? participant : null,
    }
  } catch (error) {
    console.warn("Failed to fetch chat data", error)
    return {
      messages: [],
      participant: null,
    }
  }
}
