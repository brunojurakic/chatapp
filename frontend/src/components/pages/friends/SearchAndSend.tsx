import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SearchResult {
  id: string
  name: string
  username?: string
  pendingRequest?: boolean
  incomingRequest?: boolean
  incomingRequestId?: string
}

export default function SearchAndSend() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const search = async () => {
    const token = localStorage.getItem("jwt_token")
    if (!token || !query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/search?query=${encodeURIComponent(query.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.ok) setResults(await res.json())
    } catch {
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const send = async (username: string) => {
    const token = localStorage.getItem("jwt_token")
    if (!token) return
    setSendingId(username)
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/friends/request?username=${encodeURIComponent(username)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.ok) {
        toast.success("Friend request sent")
        setResults(results.filter((r) => r.username !== username))
      } else {
        let txt = await res.text()
        try {
          const j = JSON.parse(txt)
          txt = j.error || txt
        } catch {
          // skip
        }
        toast.error(txt || "Failed to send")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSendingId(null)
    }
  }

  const accept = async (requestId: string) => {
    const token = localStorage.getItem("jwt_token")
    if (!token) return
    setAcceptingId(requestId)
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/friends/requests/${requestId}/accept`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.ok) {
        toast.success("Friend request accepted")
        setResults([])
      } else {
        let txt = await res.text()
        try {
          const j = JSON.parse(txt)
          txt = j.error || txt
        } catch {
          // skip
        }
        toast.error(txt || "Failed to accept")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle>Find users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex flex-1">
            <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-l-md bg-muted">
              @
            </span>
            <Input
              value={query}
              onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder="search by name or username"
              className="rounded-l-none"
            />
          </div>
          <Button onClick={search}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {results.length === 0 ? (
          <p className="text-muted-foreground">No users</p>
        ) : (
          results.map((r: SearchResult) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-2 border-b last:border-b-0"
            >
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.username ? `@${r.username}` : ""}
                </div>
              </div>
              <div>
                {r.incomingRequest ? (
                  <Button
                    onClick={() => {
                      if (r.incomingRequestId) accept(r.incomingRequestId)
                    }}
                    disabled={acceptingId === r.incomingRequestId}
                  >
                    {acceptingId === r.incomingRequestId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Accept"
                    )}
                  </Button>
                ) : r.pendingRequest ? (
                  <span className="px-2 py-1 rounded-md text-sm text-muted-foreground">
                    Pending
                  </span>
                ) : (
                  <Button
                    onClick={() => {
                      if (r.username) send(r.username)
                    }}
                    disabled={sendingId === r.username}
                  >
                    {sendingId === r.username ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
