import { Layout as AntLayout, Button, Space } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: '首页', end: true },
  { path: '/interviews', label: '面试列表', end: false },
  { path: '/settings', label: '设置', end: false },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AntLayout.Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: 0,
          height: 'auto',
          lineHeight: 'normal',
          borderBottom: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            OfferPilot
          </span>
          <Space size={4}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
              return (
                <Button
                  key={item.path}
                  type={isActive ? 'primary' : 'text'}
                  shape="round"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              )
            })}
          </Space>
        </div>
      </AntLayout.Header>
      <AntLayout.Content>
        <div className="max-w-5xl w-full mx-auto px-4 py-6">
          <Outlet />
        </div>
      </AntLayout.Content>
    </AntLayout>
  )
}
