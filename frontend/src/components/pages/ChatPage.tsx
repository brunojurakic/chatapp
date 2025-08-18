import React, { Suspense } from "react"
import { useParams } from "react-router-dom"
import Header from "@/components/header"
const ChatRoom = React.lazy(() =>
  import("./friends/ChatWindow").then((m) => ({ default: m.ChatRoom })),
)

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <ChatRoom conversationId={id} />
        </Suspense>
      </div>
    </div>
  )
}
