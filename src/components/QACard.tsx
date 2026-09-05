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
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-slate-900 dark:text-slate-100">
          Q{index + 1}. {qa.question}
        </div>
        <MasteryBadge mastery={qa.mastery} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
        {qa.answer}
      </p>
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5">
          {MASTERY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onMasteryChange(level)}
              className={`chip ${qa.mastery === level ? 'chip-active' : ''}`}
            >
              {level}
            </button>
          ))}
        </div>
        {onLocate && qa.sourceQuote && (
          <button
            type="button"
            onClick={onLocate}
            className="text-xs text-violet-600 dark:text-violet-300 hover:underline"
          >
            定位原文
          </button>
        )}
      </div>
    </div>
  )
}
