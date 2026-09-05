import { NavLink, Outlet } from 'react-router-dom'

const navItem = 'px-3 py-1.5 rounded-full text-sm font-medium transition-colors'
const activeClass = 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow shadow-violet-500/30'
const inactiveClass = 'text-violet-700/80 dark:text-violet-200/80 hover:bg-white/60 dark:hover:bg-white/10'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            OfferPilot 面试复盘
          </span>
          <nav className="flex gap-1.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}
            >
              首页
            </NavLink>
            <NavLink
              to="/interviews"
              className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}
            >
              面试列表
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `${navItem} ${isActive ? activeClass : inactiveClass}`}
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
