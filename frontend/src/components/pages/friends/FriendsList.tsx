import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface Friend {
  id: string
  name: string
  username?: string
  picture?: string
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null)

  const loadFriends = async () => {
    setLoading(true)
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (res.ok) setFriends(await res.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleUnfriend = async (friendId: string) => {
    if (processingIds.includes(friendId)) return
    setProcessingIds((s) => [...s, friendId])
    try {
      const t = localStorage.getItem("jwt_token")
      if (!t) throw new Error("No token")
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/${friendId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${t}` },
        },
      )
      if (res.ok) {
        setFriends((prev) => prev.filter((p) => p.id !== friendId))
        toast.success("Removed friend")
      } else {
        const text = await res.text().catch(() => "")
        toast.error(text || "Could not remove friend")
      }
    } catch {
      toast.error("Could not remove friend")
    } finally {
      setProcessingIds((s) => s.filter((id) => id !== friendId))
    }
  }

  const navigate = useNavigate()

  const openChatWith = async (friendId: string) => {
    const token = localStorage.getItem("jwt_token")
    if (!token) return toast.error("Not authenticated")
    setChatLoadingId(friendId)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/with/${friendId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) return toast.error("Could not open chat")
      const body = await res.json()
      navigate(`/chat/${body.conversationId}`)
    } catch {
      toast.error("Could not open chat")
    } finally {
      setChatLoadingId(null)
    }
  }

  useEffect(() => {
    loadFriends()
    const onAccepted = () => loadFriends()
    const onRemoved = () => loadFriends()
    window.addEventListener("friend:accepted", onAccepted)
    window.addEventListener("friend:removed", onRemoved)
    return () => {
      window.removeEventListener("friend:accepted", onAccepted)
      window.removeEventListener("friend:removed", onRemoved)
    }
  }, [])

  return (
    <>
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading friends...</span>
            </div>
          ) : friends.length === 0 ? (
            <p className="text-muted-foreground">You have no friends yet</p>
          ) : (
            friends.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    {f.picture ? (
                      <AvatarImage src={f.picture} />
                    ) : (
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                        {f.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {f.username ? `@${f.username}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => openChatWith(f.id)}
                    aria-label={`Chat ${f.name}`}
                    disabled={chatLoadingId === f.id}
                  >
                    {chatLoadingId === f.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Chat"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUnfriend(f.id)}
                    aria-label={`Unfriend ${f.name}`}
                    disabled={processingIds.includes(f.id)}
                  >
                    {processingIds.includes(f.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Unfriend"
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}
