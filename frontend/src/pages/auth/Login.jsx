import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/auth'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import campusImg from '../../assets/campus.jpg'
import heroImage from '../../assets/hero.png'

const DASHBOARD_ROUTES = {
  ADMIN: '/admin/dashboard',
  USER: '/user/dashboard',
  TECHNICIAN: '/technician/dashboard',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!emailRegex.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 3) e.password = 'Password must be at least 3 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await loginUser(form)
      login(res.data)
      toast.success(`Welcome back, ${res.data.name}!`)
      navigate(DASHBOARD_ROUTES[res.data.role] || '/user/dashboard')
    } catch (err) {
      const be = err.response?.data?.errors
      if (be) setErrors(be)
      else toast.error(err.response?.data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleGoogle = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between">

        <img
          src={campusImg}
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,58,138,0.75))',
          }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{
            background:
              'linear-gradient(to top, rgba(15,23,42,0.95), transparent)',
          }}
        />

        {/* LOGO (BIGGER + BETTER) */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-4">
            <img
              src={heroImage}
              alt="University Logo"
              className="w-16 h-16 rounded-2xl object-cover bg-white p-2 shadow-lg"
            />
            <div>
              <p className="text-white text-xl font-semibold">
                University of Melbourne
              </p>
              <p className="text-blue-200 text-sm">
                Smart Campus Portal
              </p>
            </div>
          </div>
        </div>

        {/* HERO TEXT (REALISTIC) */}
        <div className="relative z-10 p-10">
          <p className="text-4xl text-white mb-4 leading-snug">
            Empowering Students.<br />
            <span className="text-blue-400">Connecting Campus Services.</span>
          </p>

          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            Access academic resources, manage facility bookings, report maintenance issues, <br/>
            and stay connected with real-time campus updates..
          </p>

          
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">

        <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">

          {/* HEADER TEXT */}
          <h2 className="text-3xl text-white mb-1 font-semibold">
            Sign in to your account
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            Use your university credentials to access the Smart Campus system
          </p>

          {/* GOOGLE */}
          <button
  onClick={handleGoogle}
  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-5 bg-white hover:bg-gray-200 transition"
>
        {/* Google Icon */}
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>

        Continue with Google
      </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-xs text-white/60">or sign in with email</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your university email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              >
                {showPass ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
              style={{
                background:
                  'linear-gradient(135deg, #2563eb, #1e40af)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p className="text-white/60 text-sm text-center mt-6">
            New to the platform?{' '}
            <Link to="/register" className="text-blue-400">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}