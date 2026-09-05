import type { Mastery } from '../types/interview'

const STYLES: Record<Mastery, string> = {
  熟练: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  一般: 'bg-amber-100/80 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
  不熟: 'bg-rose-100/80 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
}

export function MasteryBadge({ mastery }: { mastery: Mastery | null }) {
  if (!mastery) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/50 dark:bg-white/5 text-slate-400 border border-white/60 dark:border-white/10">
        未标注
      </span>
    )
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[mastery]}`}>
      {mastery}
    </span>
  )
}
