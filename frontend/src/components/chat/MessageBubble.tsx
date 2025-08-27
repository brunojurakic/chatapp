import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { Message } from "@/types/chat"
import { ImageAttachmentWithModal } from "./ImageAttachmentWithModal"
import { FileAttachment } from "./FileAttachment"

interface MessageBubbleProps {
  message: Message
  isMe: boolean
  isFirstInGroup: boolean
  highlightQuery?: string
}

export function MessageBubble({
  message,
  isMe,
  isFirstInGroup,
  highlightQuery,
}: MessageBubbleProps) {
  const renderHighlighted = (text: string) => {
    if (!highlightQuery) return <>{text}</>
    const q = highlightQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const re = new RegExp(`(${q})`, "ig")
    const parts = text.split(re)
    return (
      <>
        {parts.map((part, i) =>
          re.test(part) ? (
            <mark
              key={i}
              className="bg-yellow-200 dark:bg-yellow-600 text-foreground/90 px-0"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </>
    )
  }
  return (
    <div
      className={`flex items-start gap-3 first:mt-1 ${isMe ? "flex-row-reverse" : ""} ${isFirstInGroup ? "mt-2" : "mt-0.5"}`}
    >
      {isFirstInGroup ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer">
              <Avatar className="h-9 w-9 border-1 flex-shrink-0">
                {message.senderPicture ? (
                  <AvatarImage
                    src={message.senderPicture}
                    alt={message.senderName}
                    className="h-9 w-9 rounded-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <AvatarFallback className="bg-muted text-foreground/80 text-xs">
                  {message.senderName
                    ?.split(" ")
                    .map((s) => s[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={8} className="w-64 p-0">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {message.senderPicture ? (
                      <AvatarImage
                        src={message.senderPicture}
                        alt={message.senderName}
                        className="h-12 w-12 rounded-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarFallback className="bg-muted text-foreground/80 text-sm">
                        {message.senderName
                          ?.split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {message.senderName}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground wrap-anywhere">
                      User ID: {message.senderId}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div aria-hidden className="h-9 w-9 flex-shrink-0" />
      )}

      <div
        className={`min-w-0 flex-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}
      >
        {isFirstInGroup ? (
          <div
            className={`flex items-baseline gap-2 mb-2 mt-2 ${isMe ? "justify-end" : ""}`}
          >
            {isMe ? (
              <>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
                <div className="truncate text-sm font-medium">
                  {message.senderName}
                </div>
              </>
            ) : (
              <>
                <div className="truncate text-sm font-medium">
                  {message.senderName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </>
            )}
          </div>
        ) : null}

        {message.attachmentUrl &&
        message.attachmentType?.startsWith("image/") ? (
          <ImageAttachmentWithModal message={message} isMe={isMe} />
        ) : message.attachmentUrl ? (
          <div className="">
            <FileAttachment
              url={message.attachmentUrl}
              name={message.attachmentName}
              isMe={isMe}
            />
            {message.content ? (
              <div className="mt-2 block max-w-[min(100%,72ch)] text-[13px] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">
                {renderHighlighted(message.content)}
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className={
              `block max-w-[min(100%,72ch)] rounded-md px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ` +
              (isMe
                ? "bg-emerald-100 text-slate-900 dark:bg-emerald-950 dark:text-slate-100 text-right"
                : "bg-zinc-200 dark:bg-neutral-900 text-foreground text-left")
            }
            role="article"
          >
            {renderHighlighted(message.content)}
          </div>
        )}
      </div>
    </div>
  )
}
