import { useAuthStore } from './stores/auth'
import { useEffect } from 'react'

const PENDING_JOIN_KEY = 'lms_pending_join_code'

export default function App({ children }) {
  const checkSession = useAuthStore((s) => s.checkSession)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  // After OAuth login, redirect to any pending join link
  useEffect(() => {
    if (!user) return
    const pendingCode = sessionStorage.getItem(PENDING_JOIN_KEY)
    if (pendingCode) {
      sessionStorage.removeItem(PENDING_JOIN_KEY)
      window.location.href = `/join/${pendingCode}`
    }
  }, [user])

  return children
}
