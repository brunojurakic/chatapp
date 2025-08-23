import { useRef, useCallback } from "react"

export interface UseTypingIndicatorOptions {
  onSendTyping: (isTyping: boolean) => void
  typingTimeoutMs?: number
}

export function useTypingIndicator({
  onSendTyping,
  typingTimeoutMs = 3000,
}: UseTypingIndicatorOptions) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.trim().length > 0) {
        if (!isTypingRef.current) {
          isTypingRef.current = true
          onSendTyping(true)
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false
          onSendTyping(false)
        }, typingTimeoutMs)
      } else {
        if (isTypingRef.current) {
          isTypingRef.current = false
          onSendTyping(false)
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    },
    [onSendTyping, typingTimeoutMs],
  )

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false
      onSendTyping(false)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [onSendTyping])

  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  return {
    handleInputChange,
    stopTyping,
    cleanup,
    isTyping: isTypingRef.current,
  }
}
