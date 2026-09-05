import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  transcript: string
  highlight?: string
}

export function TranscriptDrawer({ open, onClose, transcript, highlight }: Props) {
  const highlightRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (open && highlight) {
      highlightRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [open, highlight])

  if (!open) return null

  let body: React.ReactNode = transcript
  if (highlight) {
    const idx = transcript.indexOf(highlight)
    if (idx >= 0) {
      body = (
        <>
          {transcript.slice(0, idx)}
          <span
            ref={highlightRef}
            className="bg-fuchsia-200/80 dark:bg-fuchsia-500/30 rounded px-0.5"
          >
            {transcript.slice(idx, idx + highlight.length)}
          </span>
          {transcript.slice(idx + highlight.length)}
        </>
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-violet-950/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl h-full glass border-y-0 border-r-0 shadow-2xl p-5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">面试录音原文</h3>
          <button type="button" onClick={onClose} className="btn-secondary !px-3 !py-1 text-xs">
            关闭
          </button>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {body}
        </p>
      </div>
    </div>
  )
}
