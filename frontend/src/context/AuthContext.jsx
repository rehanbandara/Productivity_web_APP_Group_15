import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEYS = ['token', 'role', 'name', 'email', 'userId']

function safeNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, restore user from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')
      const name = localStorage.getItem('name') || ''
      const email = localStorage.getItem('email') || ''
      const userId = safeNumber(localStorage.getItem('userId'))

      if (token && role && userId != null) {
        setUser({ token, role, name, email, userId })
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (data) => {
    // data = { token, role, name, email, userId }
    const next = {
      token: data?.token || '',
      role: data?.role || '',
      name: data?.name || '',
      email: data?.email || '',
      userId: safeNumber(data?.userId),
    }

    if (!next.token || !next.role || next.userId == null) {
      // refuse invalid login payload
      setUser(null)
      return
    }

    localStorage.setItem('token', next.token)
    localStorage.setItem('role', next.role)
    localStorage.setItem('name', next.name)
    localStorage.setItem('email', next.email)
    localStorage.setItem('userId', String(next.userId))

    setUser(next)
  }

  const logout = () => {
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k))
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)