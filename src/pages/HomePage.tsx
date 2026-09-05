import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ParseReviewForm } from '../components/ParseReviewForm'
import { db } from '../db/db'
import { DeepSeekParseError, parseTranscript, type ParsedQA } from '../services/deepseekParser'
import { useSettingsStore } from '../store/settingsStore'

export function HomePage() {
  const [transcript, setTranscript] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedQA, setParsedQA] = useState<ParsedQA[] | null>(null)
  const { apiKey, model } = useSettingsStore()
  const navigate = useNavigate()

  const recentInterviews = useLiveQuery(
    () => db.interviews.orderBy('createdAt').reverse().limit(5).toArray(),
    [],
  )

  async function handleParse() {
    if (!transcript.trim()) {
      setError('请先粘贴面试录音转写文本')
      return
    }
    setError(null)
    setParsing(true)
    try {
      const result = await parseTranscript(transcript, apiKey, model)
      setParsedQA(result)
    } catch (e) {
      setError(e instanceof DeepSeekParseError ? e.message : '解析失败，请重试')
    } finally {
      setParsing(false)
    }
  }

  if (parsedQA) {
    return (
      <ParseReviewForm
        rawTranscript={transcript}
        parsedQA={parsedQA}
        onSaved={(id) => navigate(`/interviews/${id}`)}
        onCancel={() => setParsedQA(null)}
      />
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">面试解析</h2>
        <p className="text-sm text-slate-500">
          粘贴一段面试录音转写文本，AI 会自动识别出面试官的问题和你的回答。
        </p>
        {!apiKey && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            还没配置 DeepSeek API Key，请先前往{' '}
            <Link to="/settings" className="underline">
              设置页
            </Link>{' '}
            填写。
          </p>
        )}
        <textarea
          className="input w-full"
          rows={10}
          placeholder="粘贴面试录音转写文本…"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="button"
          className="btn-primary"
          disabled={parsing}
          onClick={handleParse}
        >
          {parsing ? '解析中…' : '开始解析'}
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近的面试</h2>
          <Link to="/interviews" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            查看全部
          </Link>
        </div>
        {recentInterviews?.length ? (
          <ul className="space-y-2">
            {recentInterviews.map((it) => (
              <li key={it.id}>
                <Link
                  to={`/interviews/${it.id}`}
                  className="block rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <span className="font-medium">{it.company}</span>
                  <span className="text-slate-500"> · {it.department} · {it.position} · {it.round}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">还没有保存过面试记录。</p>
        )}
      </section>
    </div>
  )
}
