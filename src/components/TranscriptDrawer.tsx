import { Drawer, Typography } from 'antd'
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
      setTimeout(() => highlightRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 200)
    }
  }, [open, highlight])

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
    <Drawer title="面试录音原文" open={open} onClose={onClose} width={480}>
      <Typography.Paragraph className="whitespace-pre-wrap leading-relaxed">{body}</Typography.Paragraph>
    </Drawer>
  )
}
