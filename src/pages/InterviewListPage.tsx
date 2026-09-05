import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { INTERVIEW_ROUNDS, type InterviewRound } from '../types/interview'

export function InterviewListPage() {
  const [roundFilter, setRoundFilter] = useState<InterviewRound | 'all'>('all')
  const [companyFilter, setCompanyFilter] = useState('')

  const interviews = useLiveQuery(
    () => db.interviews.orderBy('createdAt').reverse().toArray(),
    [],
  )

  const filtered = useMemo(() => {
    if (!interviews) return []
    return interviews.filter((it) => {
      if (roundFilter !== 'all' && it.round !== roundFilter) return false
      if (companyFilter && !it.company.toLowerCase().includes(companyFilter.toLowerCase())) return false
      return true
    })
  }, [interviews, roundFilter, companyFilter])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">面试列表</h2>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <input
          className="input"
          placeholder="按公司搜索…"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
        <select
          className="input"
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value as InterviewRound | 'all')}
        >
          <option value="all">全部轮次</option>
          {INTERVIEW_ROUNDS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500">没有符合条件的面试记录。</p>
      )}

      <ul className="grid sm:grid-cols-2 gap-3">
        {filtered.map((it) => (
          <li key={it.id}>
            <Link
              to={`/interviews/${it.id}`}
              className="glass-card block p-4 hover:bg-white/80 dark:hover:bg-white/10 transition-colors space-y-1"
            >
              <div className="font-medium">{it.company}</div>
              <div className="text-sm text-slate-500">
                {it.department || '部门未填'} · {it.position || '岗位未填'}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100/80 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  {it.round}
                </span>
                <span className="text-xs text-slate-400">{it.date}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
