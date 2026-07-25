import { useUserStore } from '../stores/user'
import { useEffect } from 'react'
import TopBar from '../components/app/TopBar'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  const fetchProfile = useUserStore((s) => s.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <main className="flex flex-col min-h-screen">
      <TopBar />
      <section className="flex-1 w-full">
        <Outlet />
      </section>
    </main>
  )
}
