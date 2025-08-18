import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

interface OutgoingDTO {
  id: string
  recipientId: string
  recipientName: string
  recipientUsername?: string
  recipientPicture?: string
  status: string
  createdAt: string
}

export default function OutgoingRequests() {
  const [outgoing, setOutgoing] = useState<OutgoingDTO[]>([])
  const [loading, setLoading] = useState(false)
  const { user, isLoading } = useAuth()

  const fetchOutgoing = async () => {
    const token = localStorage.getItem("jwt_token")
    if (!token) return
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/friends/outgoing`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.ok) setOutgoing(await res.json())
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (isLoading) {
        setLoading(false)
        return
      }
      await fetchOutgoing()
      setLoading(false)
    })()
    const onSent = () => fetchOutgoing()
    const onRejected = () => fetchOutgoing()
    window.addEventListener("friend:sent", onSent)
    window.addEventListener("friend:rejected", onRejected)
    return () => {
      window.removeEventListener("friend:sent", onSent)
      window.removeEventListener("friend:rejected", onRejected)
    }
  }, [user, isLoading])

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle>Your Outgoing Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading outgoing requests...</span>
          </div>
        ) : outgoing.length === 0 ? (
          <p className="text-muted-foreground">No outgoing requests</p>
        ) : (
          outgoing.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between p-2 border-b last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  {o.recipientPicture ? (
                    <AvatarImage src={o.recipientPicture} />
                  ) : (
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                      {o.recipientName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{o.recipientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.recipientUsername ? `@${o.recipientUsername}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
