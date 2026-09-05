export const INTERVIEW_ROUNDS = ['一面', '二面', '三面', 'HR面'] as const
export type InterviewRound = (typeof INTERVIEW_ROUNDS)[number]

export const MASTERY_LEVELS = ['熟练', '一般', '不熟'] as const
export type Mastery = (typeof MASTERY_LEVELS)[number]

export interface QAItem {
  id: string
  question: string
  answer: string
  speaker?: string
  mastery: Mastery | null
  /** 原文中的一小段摘录，用于在"查看原文"时定位高亮 */
  sourceQuote?: string
}

export interface Interview {
  id: string
  company: string
  department: string
  position: string
  round: InterviewRound
  date: string
  rawTranscript: string
  qaList: QAItem[]
  createdAt: number
  updatedAt: number
}
