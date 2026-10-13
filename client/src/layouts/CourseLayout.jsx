import { Outlet } from 'react-router-dom'

export default function CourseLayout() {
  return (
    <main className="flex flex-col h-dvh overflow-hidden">
      <section className="flex-1 w-full min-h-0 flex flex-col overflow-y-auto">
        <Outlet />
      </section>
    </main>
  )
}