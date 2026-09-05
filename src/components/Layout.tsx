import { NavLink, Outlet } from 'react-router-dom'

const navItem =
  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors'
const activeClass = 'bg-indigo-600 text-white'
const inactiveClass =
  'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-lg">OfferPilot 面试复盘</span>
          <nav className="flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeClass : inactiveClass}`
              }
            >
              首页
            </NavLink>
            <NavLink
              to="/interviews"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeClass : inactiveClass}`
              }
            >
              面试列表
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeClass : inactiveClass}`
              }
            >
              设置
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
