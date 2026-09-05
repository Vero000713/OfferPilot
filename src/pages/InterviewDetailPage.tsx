import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QACard } from '../components/QACard'
import { TranscriptDrawer } from '../components/TranscriptDrawer'
import { db } from '../db/db'
import { INTERVIEW_ROUNDS, MASTERY_LEVELS, type Interview, type InterviewRound, type Mastery } from '../types/interview'

function EditMetaForm({
  interview,
  onSaved,
  onCancel,
}: {
  interview: Interview
  onSaved: () => void
  onCancel: () => void
}) {
  const [company, setCompany] = useState(interview.company)
  const [department, setDepartment] = useState(interview.department)
  const [position, setPosition] = useState(interview.position)
  const [round, setRound] = useState<InterviewRound>(interview.round)
  const [date, setDate] = useState(interview.date)

  async function handleSave() {
    if (!company.trim()) {
      alert('公司不能为空')
      return
    }
    await db.interviews.update(interview.id, {
      company: company.trim(),
      department: department.trim(),
      position: position.trim(),
      round,
      date,
      updatedAt: Date.now(),
    })
    onSaved()
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input className="input" placeholder="公司 *" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input
          className="input"
          placeholder="部门（选填）"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          className="input"
          placeholder="岗位（选填）"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <select className="input" value={round} onChange={(e) => setRound(e.target.value as InterviewRound)}>
          {INTERVIEW_ROUNDS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input col-span-2 sm:col-span-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-primary" onClick={handleSave}>
          保存
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  )
}

export function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [masteryFilter, setMasteryFilter] = useState<Mastery | 'all'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [highlight, setHighlight] = useState<string | undefined>(undefined)
  const [editing, setEditing] = useState(false)

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
        <Link to="/interviews" className="text-violet-600 dark:text-violet-300 hover:underline">
          返回面试列表
        </Link>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold">编辑面试信息</h2>
        <EditMetaForm interview={interview} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{interview.company}</h2>
          <p className="text-sm text-slate-500">
            {interview.department || '部门未填'} · {interview.position || '岗位未填'} · {interview.round} ·{' '}
            {interview.date}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
            编辑信息
          </button>
          <button type="button" className="btn-secondary" onClick={() => setDrawerOpen(true)}>
            查看原文
          </button>
          <button type="button" className="text-sm text-rose-500 hover:underline px-1" onClick={handleDelete}>
            删除
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMasteryFilter('all')}
          className={`chip ${masteryFilter === 'all' ? 'chip-active' : ''}`}
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
              className={`chip ${masteryFilter === level ? 'chip-active' : ''}`}
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
