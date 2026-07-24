import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/landing/Sidebar'
import Hero from '../components/landing/Hero'
import AuthModal from '../components/landing/AuthModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const login = useAuthStore((s) => s.login)

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="flex min-h-screen bg-app">
      <Sidebar />
      <div className="flex-1 w-full relative">
        <Hero openModal={() => setIsModalOpen(true)} />
      </div>
      
      <AuthModal 
        open={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
        handleLogin={login} 
      />
    </main>
  )
}
