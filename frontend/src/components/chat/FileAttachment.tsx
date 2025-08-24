import { Download } from "lucide-react"
import type { MouseEvent } from "react"
import { downloadImage } from "@/lib/downloadImage"
import { Button } from "../ui/button"

interface FileAttachmentProps {
  url: string
  name?: string
  isMe?: boolean
}

export function FileAttachment({ url, name, isMe }: FileAttachmentProps) {
  const handleDownload = async (e: MouseEvent) => {
    e.preventDefault()
    await downloadImage(url, name)
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-md p-3 pl-6 max-w-sm ${
        isMe
          ? "bg-emerald-100 dark:bg-emerald-950"
          : "bg-zinc-200 dark:bg-neutral-900"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium text-sm">{name || "file"}</div>
        <div className="text-xs text-muted-foreground">Attachment</div>
      </div>

      <Button
        onClick={handleDownload}
        variant={"ghost"}
        className="hover:bg-transparent dark:hover:bg-transparent"
      >
        <Download />
      </Button>
    </div>
  )
}
