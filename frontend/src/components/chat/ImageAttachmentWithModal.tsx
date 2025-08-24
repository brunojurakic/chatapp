import type { Message } from "@/types/chat"
import { useState } from "react"
import { ImageModal } from "./ImageModal"

export function ImageAttachmentWithModal({
  message,
  isMe,
}: {
  message: Message
  isMe: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mt-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-block ${isMe ? "ml-auto" : ""}`}
          aria-label={message.attachmentName || "Open image"}
        >
          <img
            src={message.attachmentUrl}
            alt={message.attachmentName ?? "attachment"}
            className="max-h-80 w-auto rounded-md object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </button>

        {message.content ? (
          <div className="mt-2 block max-w-[min(100%,72ch)] text-[13px] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">
            {message.content}
          </div>
        ) : null}
      </div>

      <ImageModal
        src={message.attachmentUrl!}
        alt={message.attachmentName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
