import { useAuthStore } from './stores/auth'
import { useEffect } from 'react'

export default function App({ children }) {
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return children
}
