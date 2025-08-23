import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff } from "lucide-react"

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
}

export function ChatHeader({
  participant,
  connected,
  isTyping,
  onRetryConnect,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-3 bg-background/70 dark:bg-black">
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
