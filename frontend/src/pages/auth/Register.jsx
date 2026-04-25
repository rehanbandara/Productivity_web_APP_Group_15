import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../api/auth'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import campusImg from '../../assets/campus.jpg'
import heroImage from '../../assets/hero.png'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[0-9])(?=.*[@_$#!%^&*])[A-Za-z0-9@_$#!%^&*]+$/
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'University email is required'
    else if (!emailRegex.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 3) e.password = 'Minimum 3 characters required'
    else if (!passwordRegex.test(form.password)) e.password = 'Include number & special character'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await registerUser(form)
      login(res.data)
      toast.success('Welcome to University of Melbourne!')
      navigate('/user/dashboard')
    } catch (err) {
      const be = err.response?.data?.errors
      if (be) setErrors(be)
      else toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#0f172a]">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-2/5 relative overflow-hidden flex-col justify-end">
        <img src={campusImg} className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-blue-900/70" />

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={heroImage}
              className="w-14 h-14 rounded-xl bg-white p-2 shadow-lg"
            />
            <div>
              <p className="text-white text-lg font-semibold">
                University of Melbourne
              </p>
              <p className="text-blue-300 text-xs uppercase tracking-wider">
                Smart Campus Portal
              </p>
            </div>
          </div>

          <p className="text-2xl text-white leading-snug mb-3">
            Begin your journey with<br />
            <span className="text-blue-400">Smart Campus Services</span>
          </p>

          <p className="text-white/60 text-sm">
            Register to access university facilities, manage bookings,
            and stay connected with campus operations.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">

        <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">

          <h2 className="text-3xl text-white font-semibold mb-1">
            Create your account
          </h2>

          <p className="text-white/70 text-sm mb-6">
            Use your university email to register for the Smart Campus system
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="email"
                placeholder="yourname@unimelb.edu.au"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create a secure password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
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
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          <p className="text-white/60 text-sm text-center mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-blue-400">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}