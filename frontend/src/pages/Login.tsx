import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

/** 登录/注册页面 */
export default function Login() {
  const navigate = useNavigate()
  const { login, register } = useAuthStore()

  // 标签页切换：login / register
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  // 表单字段
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // 密码可见性
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // 状态
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /** 登录处理 */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  /** 注册处理 */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('请填写所有必填项')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#38BDF8]">
      {/* 玻璃拟态卡片 */}
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
        {/* 标题 */}
        <h1 className="text-center text-2xl font-bold text-white mb-6">
          AI 智能客服系统
        </h1>

        {/* 标签页切换 */}
        <div className="flex mb-6 rounded-xl bg-white/5 p-1">
          <button
            onClick={() => { setActiveTab('login'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-white/20 text-white shadow'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-white/20 text-white shadow'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            注册
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 rounded-xl bg-[#F43F5E]/20 border border-[#F43F5E]/30 px-4 py-2 text-sm text-[#F43F5E]">
            {error}
          </div>
        )}

        {/* 登录表单 */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 用户名 */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
            </div>
            {/* 密码 */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 py-3 pl-11 pr-11 text-sm outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#0F172A] to-[#38BDF8] py-3 text-sm font-medium text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>
        )}

        {/* 注册表单 */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* 用户名 */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
            </div>
            {/* 邮箱 */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
            </div>
            {/* 密码 */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 py-3 pl-11 pr-11 text-sm outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {/* 确认密码 */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 py-3 pl-11 pr-11 text-sm outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#0F172A] to-[#38BDF8] py-3 text-sm font-medium text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注 册'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
