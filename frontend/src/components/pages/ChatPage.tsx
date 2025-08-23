import React, { Suspense } from "react"
import { useParams } from "react-router-dom"
import Header from "@/components/header"
const ChatRoom = React.lazy(() =>
  import("../chat/ChatWindow").then((m) => ({ default: m.ChatRoom })),
)

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background dark:bg-black">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <ChatRoom conversationId={id} />
        </Suspense>
      </div>
    </div>
  )
}
