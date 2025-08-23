import { forwardRef } from "react"
import { MessageBubble } from "./MessageBubble"

interface Message {
  id: string
  friendshipId: string
  senderId: string
  senderName: string
  senderPicture?: string
  content: string
  createdAt: string
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string | null
  currentDisplayName: string | null
  currentUsername: string | null
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, currentUserId, currentDisplayName, currentUsername }, ref) => {
    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto px-4 py-4 bg-background dark:bg-black"
      >
        <div className="mx-auto max-w-3xl">
          {messages.map((message, index) => {
            const isMe =
              (currentUserId && message.senderId === currentUserId) ||
              (currentDisplayName &&
                message.senderName === currentDisplayName) ||
              (currentUsername && message.senderName === currentUsername) ||
              false

            const prev = messages[index - 1]
            const prevTime = prev ? Date.parse(prev.createdAt) : 0
            const curTime = Date.parse(message.createdAt)
            const isFirstInGroup =
              index === 0 ||
              prev.senderId !== message.senderId ||
              curTime - prevTime > 60_000

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isMe={isMe}
                isFirstInGroup={isFirstInGroup}
              />
            )
          })}
        </div>
      </div>
    )
  },
)
