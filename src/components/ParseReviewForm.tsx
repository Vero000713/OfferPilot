import { Button, Card, DatePicker, Form, Input, message, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import { formatDateKey } from '../lib/date'
import type { ParsedQA } from '../services/deepseekParser'
import { INTERVIEW_ROUNDS, type Interview, type InterviewRound, type QAItem } from '../types/interview'

interface Props {
  rawTranscript: string
  parsedQA: ParsedQA[]
  onSaved: (id: string) => void
  onCancel: () => void
}

interface MetaFormValues {
  company: string
  department?: string
  position?: string
  round: InterviewRound
  date: dayjs.Dayjs
}

export function ParseReviewForm({ rawTranscript, parsedQA, onSaved, onCancel }: Props) {
  const [form] = Form.useForm<MetaFormValues>()
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

  async function handleSave(values: MetaFormValues) {
    if (qaItems.length === 0) {
      message.error('没有可保存的问答了')
      return
    }
    setSaving(true)
    const now = Date.now()
    const interview: Interview = {
      id: uuid(),
      company: values.company.trim(),
      department: values.department?.trim() ?? '',
      position: values.position?.trim() ?? '',
      round: values.round,
      date: formatDateKey(values.date.toDate()),
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
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ round: '一面', date: dayjs() }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3">
            <Form.Item name="company" label="公司" rules={[{ required: true, message: '请输入公司名称' }]}>
              <Input placeholder="公司" />
            </Form.Item>
            <Form.Item name="department" label="部门（选填）">
              <Input placeholder="部门" />
            </Form.Item>
            <Form.Item name="position" label="岗位（选填）">
              <Input placeholder="岗位" />
            </Form.Item>
            <Form.Item name="round" label="轮次" rules={[{ required: true }]}>
              <Select options={INTERVIEW_ROUNDS.map((r) => ({ label: r, value: r }))} />
            </Form.Item>
            <Form.Item name="date" label="日期" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>
          <Typography.Text type="secondary" className="text-xs">
            只有公司是必填的，部门/岗位可以先留空，保存后随时可以在详情页编辑补充。
          </Typography.Text>

          <div className="space-y-3 mt-5">
            <h3 className="font-medium">解析出 {qaItems.length} 条问答，请检查并按需修改后保存</h3>
            {qaItems.map((qa, idx) => (
              <Card key={qa.id} size="small">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    #{idx + 1} {qa.speaker ? `· ${qa.speaker}` : ''}
                  </span>
                  <Button type="link" danger size="small" onClick={() => removeQA(qa.id)}>
                    删除
                  </Button>
                </div>
                <Input.TextArea
                  className="mb-2"
                  rows={2}
                  value={qa.question}
                  onChange={(e) => updateQA(qa.id, { question: e.target.value })}
                  placeholder="问题"
                />
                <Input.TextArea
                  rows={3}
                  value={qa.answer}
                  onChange={(e) => updateQA(qa.id, { answer: e.target.value })}
                  placeholder="回答"
                />
              </Card>
            ))}
            {qaItems.length === 0 && <Typography.Text type="secondary">没有可保存的问答了。</Typography.Text>}
          </div>

          <div className="flex gap-3 mt-5">
            <Button type="primary" htmlType="submit" loading={saving} disabled={qaItems.length === 0}>
              保存这场面试
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
