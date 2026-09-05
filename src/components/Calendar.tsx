import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import { formatDateKey, todayKey } from '../lib/date'
import { EVENT_TYPES, type EventType } from '../types/event'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const TYPE_DOT: Record<EventType, string> = {
  面试: 'bg-violet-500',
  笔试: 'bg-indigo-500',
  其他: 'bg-fuchsia-400',
}

const TYPE_CHIP: Record<EventType, string> = {
  面试: 'bg-violet-100/80 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300',
  笔试: 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300',
  其他: 'bg-fuchsia-100/80 text-fuchsia-700 dark:bg-fuchsia-400/10 dark:text-fuchsia-300',
}

export function Calendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('面试')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')

  const events = useLiveQuery(() => db.events.toArray(), [])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const ev of events ?? []) {
      const list = map.get(ev.date) ?? []
      list.push(ev)
      map.set(ev.date, list)
    }
    return map
  }, [events])

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1)
    const startWeekday = firstOfMonth.getDay()
    const gridStart = new Date(viewYear, viewMonth, 1 - startWeekday)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      return d
    })
  }, [viewYear, viewMonth])

  function goToMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function goToday() {
    const now = new Date()
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    setSelectedDate(todayKey())
  }

  async function handleAddEvent() {
    if (!title.trim()) return
    await db.events.add({
      id: uuid(),
      date: selectedDate,
      time: time || undefined,
      title: title.trim(),
      type,
      note: note.trim() || undefined,
      createdAt: Date.now(),
    })
    setTitle('')
    setTime('')
    setNote('')
    setType('面试')
    setFormOpen(false)
  }

  async function handleDeleteEvent(id: string) {
    await db.events.delete(id)
  }

  const selectedEvents = (eventsByDate.get(selectedDate) ?? [])
    .slice()
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {viewYear} 年 {viewMonth + 1} 月
        </h2>
        <div className="flex items-center gap-1.5">
          <button type="button" className="chip" onClick={() => goToMonth(-1)}>
            ‹ 上月
          </button>
          <button type="button" className="chip" onClick={goToday}>
            今天
          </button>
          <button type="button" className="chip" onClick={() => goToMonth(1)}>
            下月 ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const dateKey = formatDateKey(d)
          const isCurrentMonth = d.getMonth() === viewMonth
          const isToday = dateKey === todayKey()
          const isSelected = dateKey === selectedDate
          const dayEvents = eventsByDate.get(dateKey) ?? []
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                setSelectedDate(dateKey)
                setFormOpen(false)
              }}
              className={`relative flex flex-col items-center justify-start gap-1 rounded-xl py-1.5 min-h-16 border transition-colors ${
                isSelected
                  ? 'border-transparent bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow shadow-violet-500/30'
                  : isCurrentMonth
                    ? 'border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] hover:bg-white/70 dark:hover:bg-white/10'
                    : 'border-transparent text-slate-400/70 hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              <span
                className={`text-xs ${isToday && !isSelected ? 'font-bold text-violet-600 dark:text-violet-300' : ''}`}
              >
                {d.getDate()}
              </span>
              <div className="flex gap-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/90' : TYPE_DOT[ev.type]}`}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="pt-2 border-t border-white/50 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{selectedDate} 的安排</h3>
          <button type="button" className="btn-secondary !px-3 !py-1 text-xs" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? '取消' : '+ 添加事件'}
          </button>
        </div>

        {formOpen && (
          <div className="grid sm:grid-cols-2 gap-2">
            <input
              className="input sm:col-span-2"
              placeholder="事件标题，例如：字节跳动一面"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select className="input" value={type} onChange={(e) => setType(e.target.value as EventType)}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
            <input
              className="input sm:col-span-2"
              placeholder="备注（选填）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="button" className="btn-primary sm:col-span-2" onClick={handleAddEvent}>
              保存事件
            </button>
          </div>
        )}

        {selectedEvents.length === 0 && !formOpen && (
          <p className="text-sm text-slate-500">这一天还没有安排。</p>
        )}

        <ul className="space-y-1.5">
          {selectedEvents.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/40 dark:bg-white/[0.03] px-3 py-1.5"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_CHIP[ev.type]}`}>{ev.type}</span>
                {ev.time && <span className="text-slate-500 text-xs">{ev.time}</span>}
                <span>{ev.title}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteEvent(ev.id)}
                className="text-xs text-rose-500 hover:underline"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
