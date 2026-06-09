import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, BookOpen, ClipboardList, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

/** 导航项配置 */
interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { path: '/chat', label: '对话', icon: MessageCircle },
  { path: '/knowledge', label: '知识库管理', icon: BookOpen, adminOnly: true },
  { path: '/work-orders', label: '工单管理', icon: ClipboardList, adminOnly: true },
]

/** 主布局组件 */
export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  /** 登出处理 */
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  /** 过滤导航项：非管理员隐藏管理项 */
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧导航栏 */}
      <aside
        className={cn(
          'flex flex-col bg-[#0F172A] transition-all duration-300 shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* 顶部标题 */}
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          {!collapsed && (
            <span className="text-white font-bold text-lg truncate">AI 客服</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all',
              collapsed ? 'mx-auto' : 'ml-auto'
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center w-full rounded-xl py-2.5 transition-all',
                  collapsed ? 'justify-center px-0' : 'px-3',
                  isActive
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* 底部用户信息 */}
        <div className="border-t border-white/10 p-3">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
            {/* 用户头像 */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0F172A] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user?.username || '用户'}</p>
                  <p className="text-xs text-white/40 truncate">
                    {isAdmin ? '管理员' : '普通用户'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-[#F43F5E] hover:bg-white/5 transition-all"
                  title="退出登录"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
