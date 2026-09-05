import { useLiveQuery } from 'dexie-react-hooks'
import { Card, Col, Empty, Input, Row, Select, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { INTERVIEW_ROUNDS, type InterviewRound } from '../types/interview'

export function InterviewListPage() {
  const [roundFilter, setRoundFilter] = useState<InterviewRound | 'all'>('all')
  const [companyFilter, setCompanyFilter] = useState('')

  const interviews = useLiveQuery(
    () => db.interviews.orderBy('createdAt').reverse().toArray(),
    [],
  )

  const filtered = useMemo(() => {
    if (!interviews) return []
    return interviews.filter((it) => {
      if (roundFilter !== 'all' && it.round !== roundFilter) return false
      if (companyFilter && !it.company.toLowerCase().includes(companyFilter.toLowerCase())) return false
      return true
    })
  }, [interviews, roundFilter, companyFilter])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">面试列表</h2>

      <Card>
        <div className="flex flex-wrap gap-3">
          <Input.Search
            className="max-w-xs"
            placeholder="按公司搜索…"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            allowClear
          />
          <Select
            className="min-w-32"
            value={roundFilter}
            onChange={setRoundFilter}
            options={[{ label: '全部轮次', value: 'all' }, ...INTERVIEW_ROUNDS.map((r) => ({ label: r, value: r }))]}
          />
        </div>
      </Card>

      {filtered.length === 0 && <Empty description="没有符合条件的面试记录" />}

      <Row gutter={[16, 16]}>
        {filtered.map((it) => (
          <Col xs={24} sm={12} key={it.id}>
            <Link to={`/interviews/${it.id}`}>
              <Card hoverable size="small">
                <div className="font-medium">{it.company}</div>
                <div className="text-sm text-slate-500">
                  {it.department || '部门未填'} · {it.position || '岗位未填'}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Tag color="purple">{it.round}</Tag>
                  <span className="text-xs text-slate-400">{it.date}</span>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  )
}
