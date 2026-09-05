import Dexie, { type Table } from 'dexie'
import type { CalendarEvent } from '../types/event'
import type { Interview } from '../types/interview'

class OfferPilotDB extends Dexie {
  interviews!: Table<Interview, string>
  events!: Table<CalendarEvent, string>

  constructor() {
    super('OfferPilotDB')
    this.version(1).stores({
      interviews: 'id, company, round, createdAt',
    })
    this.version(2).stores({
      interviews: 'id, company, round, createdAt',
      events: 'id, date',
    })
  }
}

export const db = new OfferPilotDB()
