import { useLiveQuery } from 'dexie-react-hooks'
import { Alert, Button, Card, Col, Empty, Input, Row, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar } from '../components/Calendar'
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
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Calendar />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="面试解析" className="h-full">
            <Typography.Text type="secondary">
              粘贴一段面试录音转写文本，AI 会自动识别出面试官的问题和你的回答。
            </Typography.Text>
            {!apiKey && (
              <Alert
                className="mt-3"
                type="warning"
                showIcon
                title={
                  <>
                    还没配置 DeepSeek API Key，请先前往{' '}
                    <Link to="/settings" className="underline">
                      设置页
                    </Link>{' '}
                    填写。
                  </>
                }
              />
            )}
            <Input.TextArea
              className="mt-3 mb-3"
              rows={10}
              placeholder="粘贴面试录音转写文本…"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            {error && <Alert className="mb-3" type="error" showIcon title={error} />}
            <Button type="primary" loading={parsing} onClick={handleParse}>
              开始解析
            </Button>
          </Card>
        </Col>
      </Row>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近的面试</h2>
          <Link to="/interviews" className="text-sm text-violet-600 dark:text-violet-300 hover:underline">
            查看全部
          </Link>
        </div>
        <Card>
          {recentInterviews && recentInterviews.length > 0 ? (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {recentInterviews.map((it) => (
                <Link key={it.id} to={`/interviews/${it.id}`} className="block py-2.5 first:pt-0 last:pb-0">
                  <span className="font-medium">{it.company}</span>
                  <span className="text-slate-500">
                    {' '}
                    · {it.department || '部门未填'} · {it.position || '岗位未填'} · {it.round}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty description="还没有保存过面试记录。" />
          )}
        </Card>
      </section>
    </div>
  )
}
