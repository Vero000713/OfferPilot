import { Tag } from 'antd'
import type { Mastery } from '../types/interview'

const COLORS: Record<Mastery, string> = {
  熟练: 'success',
  一般: 'warning',
  不熟: 'error',
}

export function MasteryBadge({ mastery }: { mastery: Mastery | null }) {
  if (!mastery) {
    return <Tag>未标注</Tag>
  }
  return <Tag color={COLORS[mastery]}>{mastery}</Tag>
}
