import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children?: React.ReactNode
  /** 是否仅管理员可访问 */
  adminOnly?: boolean
}

/** 路由守卫组件：检查认证状态和管理员权限 */
export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore()

  // 未登录则跳转登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 需要管理员权限但非管理员，跳转对话页
  if (adminOnly && !isAdmin) {
    return <Navigate to="/chat" replace />
  }

  // 有子组件则渲染子组件，否则渲染 Outlet（作为布局路由使用）
  return children ? <>{children}</> : <Outlet />
}
