import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Loader } from 'lucide-react'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 bg-white/5 px-6 py-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              <ShieldCheck size={14} className="text-blue-200" />
              UNIVERSITY OF MELBOURNE
            </p>
            <p className="mt-4 text-base font-semibold text-white">Checking access…</p>
            <p className="mt-1 text-sm text-white/60">Verifying your session and permissions.</p>
          </div>

          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
              <Loader size={20} className="animate-spin" />
            </div>
            <p className="text-sm text-white/70">Loading…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
  }

  return children
}