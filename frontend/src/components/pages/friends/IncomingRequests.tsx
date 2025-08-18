import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FriendRequestDTO {
  id: string
  requesterId: string
  requesterName: string
  requesterUsername?: string
  requesterPicture?: string
  status: string
  createdAt: string
}

export default function IncomingRequests() {
  const [requests, setRequests] = useState<FriendRequestDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const token = localStorage.getItem("jwt_token")

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (res.ok) setRequests(await res.json())
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const accept = async (id: string) => {
    if (!token) return
    setAcceptingId(id)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests/${id}/accept`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.ok) {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (r.ok) setRequests(await r.json())
        toast.success("Friend request accepted")
      } else {
        const txt = await res.text()
        toast.error(txt || "Failed to accept request")
      }
    } catch {
      toast.error("Network error")
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
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.ok) {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (r.ok) setRequests(await r.json())
        toast.success("Friend request rejected")
      } else {
        const txt = await res.text()
        toast.error(txt || "Failed to reject request")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setRejectingId(null)
    }
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle>Incoming Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
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
  )
}
