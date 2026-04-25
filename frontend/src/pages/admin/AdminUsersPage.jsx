import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/users'
import { Users, Trash2, ShieldCheck, Search, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

const ROLE_BADGE_STYLES = {
  ADMIN:      'bg-red-500/15 text-red-100 border border-red-300/20',
  TECHNICIAN: 'bg-amber-500/15 text-amber-100 border border-amber-300/20',
  USER:       'bg-blue-500/15 text-blue-100 border border-blue-300/20',
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers()
      setUsers(res.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole)
      .then(() => { toast.success('Role updated'); fetchUsers() })
      .catch(() => toast.error('Failed to update role'))
  }

  const handleDelete = (userId, userName) => {
    if (!confirm(`Delete user "${userName}"?`)) return
    deleteUser(userId)
      .then(() => { toast.success('User deleted'); fetchUsers() })
      .catch(() => toast.error('Failed to delete user'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
            <ShieldCheck size={14} className="text-blue-200" />
            UNIVERSITY OF MELBOURNE 
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">User Management</h1>
          <p className="mt-2 text-sm text-white/60">
            Manage access across the Smart Campus Operations Hub.
          </p>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <Users size={18} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Registered users</p>
                <p className="text-xs text-white/60">
                  Assign roles for students, technicians, and administrators.
                </p>
              </div>
            </div>

            
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-white/55">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {users.map(u => {
                  const role = [...u.roles][0]
                  const badgeClass = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.USER

                  return (
                    <tr key={u.id} className="transition hover:bg-white/[0.06]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-500/15 text-sm font-semibold text-blue-100 ring-1 ring-blue-300/20">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-white/50">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-white/70">{u.email}</p>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className={[
                            'cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold outline-none transition',
                            'bg-white/10 text-white border border-white/15 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/40',
                          ].join(' ')}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r} className="bg-slate-900 text-white">
                              {r}
                            </option>
                          ))}
                        </select>

                        {/* Role preview pill */}
                        <div className="mt-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
                            {role}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {u.id !== user?.userId && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {loading && (
              <div className="flex items-center justify-center gap-3 p-10 text-sm text-white/60">
                <Loader size={16} className="animate-spin text-blue-200" />
                Loading users…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}