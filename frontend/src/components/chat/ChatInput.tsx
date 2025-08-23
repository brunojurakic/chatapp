import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"

interface ChatInputProps {
  input: string
  sendLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}

export function ChatInput({
  input,
  sendLoading,
  onInputChange,
  onSend,
}: ChatInputProps) {
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
      </div>
    </div>
  )
}
