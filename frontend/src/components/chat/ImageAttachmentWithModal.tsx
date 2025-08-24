import type { Message } from "@/types/chat"
import { useState } from "react"
import { ImageModal } from "./ImageModal"
import { downloadImage } from "@/lib/downloadImage"
import { Download } from "lucide-react"

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
        <div className={`relative inline-block group ${isMe ? "ml-auto" : ""}`}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={message.attachmentName || "Open image"}
            className="inline-block"
          >
            <img
              src={message.attachmentUrl}
              alt={message.attachmentName ?? "attachment"}
              className="max-h-80 w-auto rounded-md object-cover block"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </button>

          <button
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              await downloadImage(
                message.attachmentUrl!,
                message.attachmentName,
              )
            }}
            className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
            aria-label="Download image"
          >
            <Download />
          </button>
        </div>

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
