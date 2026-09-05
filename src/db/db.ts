import Dexie, { type Table } from 'dexie'
import type { Interview } from '../types/interview'

class OfferPilotDB extends Dexie {
  interviews!: Table<Interview, string>

  constructor() {
    super('OfferPilotDB')
    this.version(1).stores({
      interviews: 'id, company, round, createdAt',
    })
  }
}

export const db = new OfferPilotDB()
