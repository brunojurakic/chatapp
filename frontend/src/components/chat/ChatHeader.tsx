import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Wifi,
  WifiOff,
  Search,
  Loader2,
  StepBack,
  StepForward,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "../ui/input"

interface Participant {
  id: string
  username: string
  name: string
  picture?: string
}

interface ChatHeaderProps {
  participant: Participant | null
  connected: boolean
  isTyping: boolean
  onRetryConnect: () => void
  onSearch?: (q: string) => void
  onClearSearch?: () => void
  onPrevMatch?: () => void
  onNextMatch?: () => void
  matchesCount?: number
  currentMatchIndex?: number
  searchLoading?: boolean
}

export function ChatHeader({
  participant,
  connected,
  isTyping,
  onRetryConnect,
  onSearch,
  onClearSearch,
  onPrevMatch,
  onNextMatch,
  matchesCount,
  currentMatchIndex,
  searchLoading,
}: ChatHeaderProps) {
  const [input, setInput] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  useEffect(() => {
    if (!matchesCount) return
  }, [matchesCount])

  useEffect(() => {
    if (!onSearch) return
    const handler = setTimeout(() => {
      if (input.trim()) {
        onSearch(input.trim())
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [input, onSearch])
  return (
    <div className="relative flex items-center justify-between border-b px-6 py-3 bg-background/70 dark:bg-background">
      <div className="flex items-center gap-3">
        {participant ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              {participant.picture ? (
                <AvatarImage
                  src={participant.picture}
                  alt={participant.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-muted text-foreground/80 text-xs">
                {participant.name
                  ?.split(" ")
                  .map((s) => s[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <div className="text-sm font-medium">{participant.name}</div>
              <div className="text-xs text-muted-foreground">
                @{participant.username}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-base font-semibold">Direct Messages</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <div className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="search"
              placeholder="Search messages"
              className="pl-8 input input-sm bg-transparent border rounded px-2 py-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearch) {
                  const val = input.trim()
                  if (val) onSearch(val)
                }
              }}
            />
            {searchLoading ? (
              <Loader2 className="ml-2 animate-spin text-sm text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-muted-foreground px-2"
              onClick={() => {
                setInput("")
                if (onClearSearch) onClearSearch()
              }}
            >
              Clear
            </button>
            {matchesCount && matchesCount > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="px-2"
                  onClick={() => onPrevMatch && onPrevMatch()}
                  aria-label="Previous result"
                >
                  <StepBack size={16} />
                </button>
                <div className="text-xs text-muted-foreground">
                  {currentMatchIndex !== undefined && currentMatchIndex >= 0
                    ? `${currentMatchIndex + 1} / ${matchesCount}`
                    : `${matchesCount}`}
                </div>
                <button
                  className="px-2"
                  onClick={() => onNextMatch && onNextMatch()}
                  aria-label="Next result"
                >
                  <StepForward size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="md:hidden">
          <button
            className="p-2"
            onClick={() => setShowMobileSearch((prev) => !prev)}
            aria-label="Open search"
          >
            <Search />
          </button>
        </div>
        {showMobileSearch ? (
          <div className="absolute left-0 right-0 top-full bg-background/95 p-3 z-50 md:hidden border-t transition-all duration-200 ease-out transform">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  type="search"
                  placeholder="Search messages"
                  className="flex-1 pl-3 input input-sm bg-transparent border rounded px-2 py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && onSearch) {
                      const val = input.trim()
                      if (val) onSearch(val)
                    }
                  }}
                />
                <button
                  className="p-2"
                  onClick={() => {
                    setInput("")
                    setShowMobileSearch(false)
                    if (onClearSearch) onClearSearch()
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2"
                    onClick={() => onPrevMatch && onPrevMatch()}
                    aria-label="Previous result"
                  >
                    <StepBack size={18} />
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {matchesCount && matchesCount > 0
                      ? currentMatchIndex !== undefined &&
                        currentMatchIndex >= 0
                        ? `${currentMatchIndex + 1} / ${matchesCount}`
                        : `${matchesCount}`
                      : "0"}
                  </div>
                  <button
                    className="p-2"
                    onClick={() => onNextMatch && onNextMatch()}
                    aria-label="Next result"
                  >
                    <StepForward size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {isTyping && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center space-x-1">
              <div
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              typing
            </span>
          </div>
        )}

        <Badge variant={connected ? "default" : "destructive"}>
          {connected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span className="ml-1">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </Badge>
        {!connected ? (
          <Button size="sm" variant="outline" onClick={onRetryConnect}>
            Reconnect
          </Button>
        ) : null}
      </div>
    </div>
  )
}
