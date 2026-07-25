import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import Loading from '../components/app/Loading'

export default function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  
  if (loading) {
     return <Loading/>
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
