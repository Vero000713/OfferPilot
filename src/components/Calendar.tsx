import { useLiveQuery } from 'dexie-react-hooks'
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Tag, TimePicker, Typography } from 'antd'
import { Calendar as AntCalendar } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import { formatDateKey, todayKey } from '../lib/date'
import { EVENT_TYPES, type CalendarEvent, type EventType } from '../types/event'

const TYPE_DOT: Record<EventType, string> = {
  面试: 'bg-violet-500',
  笔试: 'bg-indigo-500',
  其他: 'bg-fuchsia-400',
}

const TYPE_TAG_COLOR: Record<EventType, string> = {
  面试: 'purple',
  笔试: 'geekblue',
  其他: 'magenta',
}

interface EventFormValues {
  title: string
  type: EventType
  time?: Dayjs
  note?: string
}

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<EventFormValues>()

  const events = useLiveQuery(() => db.events.toArray(), [])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events ?? []) {
      const list = map.get(ev.date) ?? []
      list.push(ev)
      map.set(ev.date, list)
    }
    return map
  }, [events])

  async function handleAddEvent(values: EventFormValues) {
    await db.events.add({
      id: uuid(),
      date: selectedDate,
      time: values.time ? values.time.format('HH:mm') : undefined,
      title: values.title.trim(),
      type: values.type,
      note: values.note?.trim() || undefined,
      createdAt: Date.now(),
    })
    form.resetFields()
    setModalOpen(false)
  }

  async function handleDeleteEvent(id: string) {
    await db.events.delete(id)
  }

  const selectedEvents = (eventsByDate.get(selectedDate) ?? [])
    .slice()
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))

  return (
    <Card>
      <AntCalendar
        fullscreen={false}
        value={dayjs(selectedDate)}
        onSelect={(d) => setSelectedDate(formatDateKey(d.toDate()))}
        cellRender={(date, info) => {
          if (info.type !== 'date') return null
          const key = formatDateKey(date.toDate())
          const dayEvents = eventsByDate.get(key) ?? []
          if (dayEvents.length === 0) return null
          return (
            <div className="flex gap-0.5 justify-center mt-0.5">
              {dayEvents.slice(0, 3).map((ev) => (
                <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[ev.type]}`} />
              ))}
            </div>
          )
        }}
      />

      <div className="pt-3 mt-1 border-t border-black/5 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <Typography.Text strong>{selectedDate} 的安排</Typography.Text>
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => {
              form.resetFields()
              setModalOpen(true)
            }}
          >
            + 添加事件
          </Button>
        </div>

        {selectedEvents.length === 0 && (
          <Typography.Text type="secondary" className="text-sm">
            这一天还没有安排。
          </Typography.Text>
        )}

        <ul className="space-y-1.5">
          {selectedEvents.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] px-3 py-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Tag color={TYPE_TAG_COLOR[ev.type]}>{ev.type}</Tag>
                {ev.time && <span className="text-slate-500 text-xs">{ev.time}</span>}
                <span>{ev.title}</span>
              </div>
              <Popconfirm title="删除这条安排？" onConfirm={() => handleDeleteEvent(ev.id)} okText="删除" cancelText="取消">
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        title={`添加事件 · ${selectedDate}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleAddEvent} initialValues={{ type: '面试' }}>
          <Form.Item name="title" label="事件标题" rules={[{ required: true, message: '请输入事件标题' }]}>
            <Input placeholder="例如：字节跳动一面" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={EVENT_TYPES.map((t) => ({ label: t, value: t }))} />
          </Form.Item>
          <Form.Item name="time" label="时间（选填）">
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>
          <Form.Item name="note" label="备注（选填）">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
