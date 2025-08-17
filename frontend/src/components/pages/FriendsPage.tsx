import React, { useEffect, useState } from "react"
import Header from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface Friend {
  id: string
  name: string
  username?: string
  picture?: string
}

interface FriendRequestDTO {
  id: string
  requesterId: string
  requesterName: string
  requesterUsername?: string
  requesterPicture?: string
  status: string
  createdAt: string
}

const FriendsPage: React.FC = () => {
  useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequestDTO[]>([])
  const [usernameToSend, setUsernameToSend] = useState("")

  const token = localStorage.getItem("jwt_token")
  const [isSending, setIsSending] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    (async () => {
      setLoadingFriends(true)
      setLoadingRequests(true)
      if (!token) {
        setLoadingFriends(false)
        setLoadingRequests(false)
        return
      }
      try {
        const res1 = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res1.ok) setFriends(await res1.json())
      } catch {
        // skip
      } finally {
        setLoadingFriends(false)
      }

      try {
        const res2 = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res2.ok) setRequests(await res2.json())
      } catch {
        // skip
      } finally {
        setLoadingRequests(false)
      }
    })()
  }, [token])

  const sendRequest = async () => {
    if (!token || !usernameToSend.trim()) return
    setIsSending(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/request?username=${encodeURIComponent(
          usernameToSend.trim()
        )}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (res.ok) {
        setUsernameToSend("")
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (r.ok) setRequests(await r.json())
        toast.success('Friend request sent')
      } else {
        let txt = await res.text()
        try {
          const j = JSON.parse(txt)
          txt = j.error || txt
        } catch {
          // skip
        }

        if (txt && txt.includes('Cannot send friend request to yourself')) {
          toast.error("You can't send a friend request to yourself")
        } else {
          toast.error(txt || 'Failed to send friend request')
        }
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsSending(false)
    }
  }

  const accept = async (id: string) => {
    if (!token) return
    setAcceptingId(id)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests/${id}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (res.ok) {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (r.ok) setRequests(await r.json())
        const f = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (f.ok) setFriends(await f.json())
        toast.success('Friend request accepted')
      } else {
        const txt = await res.text()
        toast.error(txt || 'Failed to accept request')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setAcceptingId(null)
    }
  }

  const reject = async (id: string) => {
    if (!token) return
    setRejectingId(id)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests/${id}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (res.ok) {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (r.ok) setRequests(await r.json())
        toast.success('Friend request rejected')
      } else {
        const txt = await res.text()
        toast.error(txt || 'Failed to reject request')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setRejectingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">Friends</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle>Send Friend Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-l-md bg-muted">
                    @
                  </span>
                  <Input
                    value={usernameToSend}
                    onChange={(e) =>
                      setUsernameToSend((e.target as HTMLInputElement).value)
                    }
                    placeholder="their-username"
                    className={"flex-1 rounded-l-none mr-2"}
                  />
                  <Button onClick={sendRequest} className="flex items-center gap-2">
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle>Incoming Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading incoming requests...</span>
                </div>
              ) : requests.length === 0 ? (
                <p className="text-muted-foreground">No pending requests</p>
              ) : (
                requests.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {r.requesterPicture ? (
                          <AvatarImage src={r.requesterPicture} />
                        ) : (
                          <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                            {r.requesterName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{r.requesterName}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.requesterUsername ? `@${r.requesterUsername}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => reject(r.id)}
                        className="p-2"
                        title="Reject"
                        aria-label="Reject"
                      >
                        {rejectingId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => accept(r.id)}
                        className="p-2"
                        title="Accept"
                        aria-label="Accept"
                      >
                        {acceptingId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFriends ? (
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
                        <AvatarImage src={f.picture} />
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                          {f.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {f.username ? `@${f.username}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default FriendsPage
