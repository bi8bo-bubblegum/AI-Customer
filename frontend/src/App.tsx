import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Chat from '@/pages/Chat'
import Knowledge from '@/pages/Knowledge'
import WorkOrders from '@/pages/WorkOrders'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

/** 主应用组件 */
export default function App() {
  return (
    <Routes>
      {/* 登录/注册 */}
      <Route path="/login" element={<Login />} />

      {/* 需要认证的路由 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/knowledge"
            element={
              <ProtectedRoute adminOnly>
                <Knowledge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-orders"
            element={
              <ProtectedRoute adminOnly>
                <WorkOrders />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* 默认重定向 */}
      <Route path="/" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}
