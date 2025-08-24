import React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Paperclip, Send } from "lucide-react"

interface ChatInputProps {
  input: string
  sendLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onFileSelected?: (file: File) => void
}

export function ChatInput({
  input,
  sendLoading,
  onInputChange,
  onSend,
  onFileSelected,
}: ChatInputProps) {
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  const triggerFile = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && onFileSelected) onFileSelected(f)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="border-t px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Message"
          className="flex-1"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
        />
        <Button
          onClick={onSend}
          disabled={sendLoading || input.trim() === ""}
          className="shrink-0"
        >
          {sendLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="mr-1.5 h-4 w-4" />
              Send
            </>
          )}
        </Button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={triggerFile} variant="outline">
          <Paperclip />
        </Button>
      </div>
    </div>
  )
}
