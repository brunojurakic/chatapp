import * as React from "react"

import { cn } from "@/lib/utils"

type Props = React.ComponentProps<"textarea"> & {
  maxRows?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className, maxRows = 4, ...props }, forwardedRef) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useImperativeHandle(
      forwardedRef,
      () => internalRef.current as HTMLTextAreaElement,
      [],
    )

    const adjust = React.useCallback(() => {
      const ta = internalRef.current
      if (!ta) return
      try {
        ta.style.height = "auto"
        const cs = getComputedStyle(ta)
        const lineHeight = parseFloat(cs.lineHeight) || 20
        const maxHeight = lineHeight * maxRows
        const newHeight = Math.min(ta.scrollHeight, maxHeight)
        ta.style.height = `${newHeight}px`
        ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden"
      } catch {
        /* ignore */
      }
    }, [maxRows])

    React.useEffect(() => {
      adjust()
    }, [adjust, props.value])

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      adjust()
      if (props.onInput)
        props.onInput(e as unknown as React.FormEvent<HTMLTextAreaElement>)
    }

    return (
      <textarea
        ref={internalRef}
        data-slot="textarea"
        rows={1}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
          className,
        )}
        onInput={handleInput}
        {...props}
      />
    )
  },
)

Textarea.displayName = "Textarea"

export { Textarea }
