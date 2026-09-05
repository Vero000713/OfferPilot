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
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
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
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                qa.mastery === level
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        {onLocate && qa.sourceQuote && (
          <button
            type="button"
            onClick={onLocate}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            定位原文
          </button>
        )}
      </div>
    </div>
  )
}
