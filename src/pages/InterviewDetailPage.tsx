import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QACard } from '../components/QACard'
import { TranscriptDrawer } from '../components/TranscriptDrawer'
import { db } from '../db/db'
import { MASTERY_LEVELS, type Mastery } from '../types/interview'

export function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [masteryFilter, setMasteryFilter] = useState<Mastery | 'all'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [highlight, setHighlight] = useState<string | undefined>(undefined)

  const interview = useLiveQuery(
    () => (id ? db.interviews.get(id) : undefined),
    [id],
  )

  const filteredQA = useMemo(() => {
    if (!interview) return []
    if (masteryFilter === 'all') return interview.qaList
    return interview.qaList.filter((qa) => qa.mastery === masteryFilter)
  }, [interview, masteryFilter])

  async function handleMasteryChange(qaId: string, mastery: Mastery) {
    if (!interview) return
    const updatedList = interview.qaList.map((qa) =>
      qa.id === qaId ? { ...qa, mastery: qa.mastery === mastery ? null : mastery } : qa,
    )
    await db.interviews.update(interview.id, {
      qaList: updatedList,
      updatedAt: Date.now(),
    })
  }

  async function handleDelete() {
    if (!interview) return
    if (!confirm('确定要删除这场面试记录吗？此操作不可撤销。')) return
    await db.interviews.delete(interview.id)
    navigate('/interviews')
  }

  if (interview === undefined) {
    return <p className="text-sm text-slate-500">加载中…</p>
  }
  if (interview === null || !interview) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">没有找到这场面试记录。</p>
        <Link to="/interviews" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          返回面试列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{interview.company}</h2>
          <p className="text-sm text-slate-500">
            {interview.department} · {interview.position} · {interview.round} · {interview.date}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setDrawerOpen(true)}>
            查看原文
          </button>
          <button
            type="button"
            className="text-sm text-rose-500 hover:underline"
            onClick={handleDelete}
          >
            删除
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMasteryFilter('all')}
          className={`px-3 py-1 rounded-full text-xs border ${
            masteryFilter === 'all'
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          全部 ({interview.qaList.length})
        </button>
        {MASTERY_LEVELS.map((level) => {
          const count = interview.qaList.filter((qa) => qa.mastery === level).length
          return (
            <button
              key={level}
              type="button"
              onClick={() => setMasteryFilter(level)}
              className={`px-3 py-1 rounded-full text-xs border ${
                masteryFilter === level
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {level} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filteredQA.map((qa) => {
          const index = interview.qaList.findIndex((item) => item.id === qa.id)
          return (
            <QACard
              key={qa.id}
              qa={qa}
              index={index}
              onMasteryChange={(mastery) => handleMasteryChange(qa.id, mastery)}
              onLocate={() => {
                setHighlight(qa.sourceQuote)
                setDrawerOpen(true)
              }}
            />
          )
        })}
        {filteredQA.length === 0 && (
          <p className="text-sm text-slate-500">这个筛选条件下没有问答。</p>
        )}
      </div>

      <TranscriptDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setHighlight(undefined)
        }}
        transcript={interview.rawTranscript}
        highlight={highlight}
      />
    </div>
  )
}
