import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import type { ParsedQA } from '../services/deepseekParser'
import { INTERVIEW_ROUNDS, type Interview, type InterviewRound, type QAItem } from '../types/interview'

interface Props {
  rawTranscript: string
  parsedQA: ParsedQA[]
  onSaved: (id: string) => void
  onCancel: () => void
}

export function ParseReviewForm({ rawTranscript, parsedQA, onSaved, onCancel }: Props) {
  const [company, setCompany] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [round, setRound] = useState<InterviewRound>('一面')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [qaItems, setQaItems] = useState<QAItem[]>(() =>
    parsedQA.map((qa) => ({
      id: uuid(),
      question: qa.question,
      answer: qa.answer,
      speaker: qa.speaker,
      sourceQuote: qa.sourceQuote,
      mastery: null,
    })),
  )
  const [saving, setSaving] = useState(false)

  function updateQA(id: string, patch: Partial<QAItem>) {
    setQaItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeQA(id: string) {
    setQaItems((items) => items.filter((item) => item.id !== id))
  }

  async function handleSave() {
    if (!company.trim() || !position.trim()) {
      alert('请至少填写公司和岗位')
      return
    }
    setSaving(true)
    const now = Date.now()
    const interview: Interview = {
      id: uuid(),
      company: company.trim(),
      department: department.trim(),
      position: position.trim(),
      round,
      date,
      rawTranscript,
      qaList: qaItems,
      createdAt: now,
      updatedAt: now,
    }
    await db.interviews.add(interview)
    setSaving(false)
    onSaved(interview.id)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input
          className="input"
          placeholder="公司"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="input"
          placeholder="部门"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          className="input"
          placeholder="岗位"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <select
          className="input"
          value={round}
          onChange={(e) => setRound(e.target.value as InterviewRound)}
        >
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

      <div className="space-y-3">
        <h3 className="font-medium">
          解析出 {qaItems.length} 条问答，请检查并按需修改后保存
        </h3>
        {qaItems.map((qa, idx) => (
          <div
            key={qa.id}
            className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                #{idx + 1} {qa.speaker ? `· ${qa.speaker}` : ''}
              </span>
              <button
                type="button"
                onClick={() => removeQA(qa.id)}
                className="text-xs text-rose-500 hover:underline"
              >
                删除
              </button>
            </div>
            <textarea
              className="input w-full"
              rows={2}
              value={qa.question}
              onChange={(e) => updateQA(qa.id, { question: e.target.value })}
              placeholder="问题"
            />
            <textarea
              className="input w-full"
              rows={3}
              value={qa.answer}
              onChange={(e) => updateQA(qa.id, { answer: e.target.value })}
              placeholder="回答"
            />
          </div>
        ))}
        {qaItems.length === 0 && (
          <p className="text-sm text-slate-500">没有可保存的问答了。</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving || qaItems.length === 0}
          onClick={handleSave}
          className="btn-primary"
        >
          {saving ? '保存中…' : '保存这场面试'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
      </div>
    </div>
  )
}
