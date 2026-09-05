export const EVENT_TYPES = ['面试', '笔试', '其他'] as const
export type EventType = (typeof EVENT_TYPES)[number]

export interface CalendarEvent {
  id: string
  date: string
  time?: string
  title: string
  type: EventType
  note?: string
  createdAt: number
}
