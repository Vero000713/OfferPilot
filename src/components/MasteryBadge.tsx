import type { Mastery } from '../types/interview'

const STYLES: Record<Mastery, string> = {
  熟练: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  一般: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  不熟: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

export function MasteryBadge({ mastery }: { mastery: Mastery | null }) {
  if (!mastery) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        未标注
      </span>
    )
  }
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[mastery]}`}
    >
      {mastery}
    </span>
  )
}
