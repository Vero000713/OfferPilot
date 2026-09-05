import { useLiveQuery } from 'dexie-react-hooks'
import { Button, Card, DatePicker, Form, Input, message, Modal, Popconfirm, Segmented, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QACard } from '../components/QACard'
import { TranscriptDrawer } from '../components/TranscriptDrawer'
import { db } from '../db/db'
import { formatDateKey } from '../lib/date'
import { INTERVIEW_ROUNDS, MASTERY_LEVELS, type Interview, type InterviewRound, type Mastery } from '../types/interview'

interface MetaFormValues {
  company: string
  department?: string
  position?: string
  round: InterviewRound
  date: dayjs.Dayjs
}

function EditMetaModal({
  interview,
  open,
  onClose,
}: {
  interview: Interview
  open: boolean
  onClose: () => void
}) {
  const [form] = Form.useForm<MetaFormValues>()

  async function handleSave(values: MetaFormValues) {
    await db.interviews.update(interview.id, {
      company: values.company.trim(),
      department: values.department?.trim() ?? '',
      position: values.position?.trim() ?? '',
      round: values.round,
      date: formatDateKey(values.date.toDate()),
      updatedAt: Date.now(),
    })
    message.success('已保存')
    onClose()
  }

  return (
    <Modal
      title="编辑面试信息"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          company: interview.company,
          department: interview.department,
          position: interview.position,
          round: interview.round,
          date: dayjs(interview.date),
        }}
      >
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
      </Form>
    </Modal>
  )
}

export function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [masteryFilter, setMasteryFilter] = useState<Mastery | 'all'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [highlight, setHighlight] = useState<string | undefined>(undefined)
  const [editModalOpen, setEditModalOpen] = useState(false)

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
    await db.interviews.delete(interview.id)
    navigate('/interviews')
  }

  if (interview === undefined) {
    return <Typography.Text type="secondary">加载中…</Typography.Text>
  }
  if (interview === null || !interview) {
    return (
      <div className="space-y-3">
        <Typography.Text type="secondary">没有找到这场面试记录。</Typography.Text>
        <br />
        <Link to="/interviews" className="text-violet-600 dark:text-violet-300 hover:underline">
          返回面试列表
        </Link>
      </div>
    )
  }

  const segmentedOptions = [
    { label: `全部 (${interview.qaList.length})`, value: 'all' },
    ...MASTERY_LEVELS.map((level) => ({
      label: `${level} (${interview.qaList.filter((qa) => qa.mastery === level).length})`,
      value: level,
    })),
  ]

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{interview.company}</h2>
            <Typography.Text type="secondary">
              {interview.department || '部门未填'} · {interview.position || '岗位未填'} · {interview.round} ·{' '}
              {interview.date}
            </Typography.Text>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditModalOpen(true)}>编辑信息</Button>
            <Button onClick={() => setDrawerOpen(true)}>查看原文</Button>
            <Popconfirm
              title="确定要删除这场面试记录吗？"
              description="此操作不可撤销。"
              onConfirm={handleDelete}
              okText="删除"
              cancelText="取消"
            >
              <Button danger>删除</Button>
            </Popconfirm>
          </div>
        </div>
      </Card>

      <Segmented
        value={masteryFilter}
        onChange={(v) => setMasteryFilter(v as Mastery | 'all')}
        options={segmentedOptions}
      />

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
          <Typography.Text type="secondary">这个筛选条件下没有问答。</Typography.Text>
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

      <EditMetaModal interview={interview} open={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  )
}
