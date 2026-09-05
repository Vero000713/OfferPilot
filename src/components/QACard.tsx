import { Button, Card, Segmented, Typography } from 'antd'
import { MASTERY_LEVELS, type Mastery, type QAItem } from '../types/interview'
import { MasteryBadge } from './MasteryBadge'

interface Props {
  qa: QAItem
  index: number
  onMasteryChange: (mastery: Mastery) => void
  onLocate?: () => void
}

export function QACard({ qa, index, onMasteryChange, onLocate }: Props) {
  return (
    <Card size="small">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Typography.Text strong>
          Q{index + 1}. {qa.question}
        </Typography.Text>
        <MasteryBadge mastery={qa.mastery} />
      </div>
      <Typography.Paragraph type="secondary" className="!mb-3 whitespace-pre-wrap">
        {qa.answer}
      </Typography.Paragraph>
      <div className="flex items-center justify-between">
        <Segmented
          size="small"
          value={qa.mastery ?? undefined}
          options={[...MASTERY_LEVELS]}
          onChange={(value) => onMasteryChange(value as Mastery)}
        />
        {onLocate && qa.sourceQuote && (
          <Button type="link" size="small" onClick={onLocate}>
            定位原文
          </Button>
        )}
      </div>
    </Card>
  )
}
