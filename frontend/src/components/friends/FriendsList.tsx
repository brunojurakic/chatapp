import { useEffect, useState, useRef } from "react"
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
  const [confirmFriendId, setConfirmFriendId] = useState<string | null>(null)
  const [modalMounted, setModalMounted] = useState(false)
  const [modalEntered, setModalEntered] = useState(false)
  const timeoutRef = useRef<number | null>(null)

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

  const closeModal = () => {
    setModalEntered(false)
    timeoutRef.current = window.setTimeout(() => {
      setModalMounted(false)
      setConfirmFriendId(null)
    }, 200)
  }

  const openModal = (friendId: string) => {
    setConfirmFriendId(friendId)
    setModalMounted(true)
    setModalEntered(false)
    requestAnimationFrame(() => {
      setModalEntered(true)
    })
  }

  const confirmUnfriend = async () => {
    if (!confirmFriendId) return
    try {
      setProcessingIds((prev) => [...prev, confirmFriendId])
      const t = localStorage.getItem("jwt_token")
      if (!t) throw new Error("No token")
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/${confirmFriendId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${t}` },
        },
      )
      if (res.ok) {
        setFriends((prev) => prev.filter((p) => p.id !== confirmFriendId))
        toast.success("Removed friend")
      } else {
        const text = await res.text().catch(() => "")
        toast.error(text || "Could not remove friend")
      }
    } catch {
      toast.error("Could not remove friend")
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== confirmFriendId))
      closeModal()
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
            <div className="space-y-3">
              <p className="text-muted-foreground">You have no friends yet</p>
              <div>
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    try {
                      localStorage.setItem("friends:selectedTab", "find")
                    } catch {
                      /* ignore */
                    }
                    try {
                      window.dispatchEvent(
                        new CustomEvent("friends:selectTab", {
                          detail: "find",
                        }),
                      )
                    } catch {
                      /* ignore */
                    }
                    navigate("/friends")
                  }}
                >
                  Find friends
                </Button>
              </div>
            </div>
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
                    variant={"accent"}
                  >
                    {chatLoadingId === f.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Chat"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openModal(f.id)}
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

      {modalMounted && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
            modalEntered ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <Card
            className={`w-96 transition-all duration-200 ease-out ${
              modalEntered ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Confirm Unfriend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Are you sure you want to unfriend{" "}
                <span className="font-medium">
                  {friends.find((f) => f.id === confirmFriendId)?.name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmUnfriend}
                  disabled={processingIds.includes(confirmFriendId || "")}
                >
                  {processingIds.includes(confirmFriendId || "") ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
