import { useState } from "react"
import type { FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { tokenUtils, apiUtils } from "@/utils/apiUtils"

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
    if (!tokenUtils.exists() || !query.trim()) return
    setLoading(true)
    try {
      const res = await apiUtils.get(
        `/api/users/search?query=${encodeURIComponent(query.trim())}`,
      )
      if (res.ok) setResults(await res.json())
    } catch {
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const send = async (username: string) => {
    if (!tokenUtils.exists()) return
    setSendingId(username)
    try {
      const res = await apiUtils.post(
        `/api/friends/request?username=${encodeURIComponent(username)}`,
        {},
      )
      if (res.ok) {
        toast.success("Friend request sent")
        setResults(results.filter((r) => r.username !== username))
        try {
          window.dispatchEvent(
            new CustomEvent("friend:sent", { detail: { username } }),
          )
        } catch {
          // ignore
        }
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
    if (!tokenUtils.exists()) return
    setAcceptingId(requestId)
    try {
      const res = await apiUtils.post(
        `/api/friends/requests/${requestId}/accept`,
        {},
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
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            search()
          }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="flex flex-1">
            <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-l-md bg-muted">
              @
            </span>
            <Input
              value={query}
              onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder="name/username"
              className="rounded-l-none"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            aria-label="Search users"
            variant={"accent"}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </form>

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
