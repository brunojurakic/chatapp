import { useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Download, X } from "lucide-react"
import { downloadImage } from "@/lib/downloadImage"

interface ImageModalProps {
  src: string
  alt?: string
  open: boolean
  onClose: () => void
}

export function ImageModal({ src, alt, open, onClose }: ImageModalProps) {
  const [entered, setEntered] = useState(false)
  const [mounted, setMounted] = useState(open)
  const timeoutRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (mounted) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [mounted, onClose])

  useEffect(() => {
    if (open) {
      setMounted(true)
      setEntered(false)
      const raf = requestAnimationFrame(() => {
        if (containerRef.current) containerRef.current.getBoundingClientRect()
        setEntered(true)
      })
      return () => cancelAnimationFrame(raf)
    }

    if (!open && mounted) {
      setEntered(false)
      timeoutRef.current = window.setTimeout(() => {
        setMounted(false)
      }, 220)
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [open, mounted])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${
        entered ? "bg-black/70" : "bg-black/0"
      }`}
      onClick={onClose}
      aria-modal
      role="dialog"
    >
      <div
        ref={containerRef}
        className={`relative max-h-[90vh] max-w-[90vw] p-2 transform transition-all duration-200 ease-out ${
          entered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          className="right-5 top-5 fixed"
          onMouseDown={(e) => e.stopPropagation()}
          variant={"default"}
        >
          <X />
        </Button>

        <Button
          onClick={async (e) => {
            e.stopPropagation()
            await downloadImage(src)
          }}
          className="left-5 top-5 fixed"
          variant={"default"}
        >
          <Download />
        </Button>

        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-lg"
          style={{ minWidth: 160, minHeight: 120 }}
        />
      </div>
    </div>
  )
}
