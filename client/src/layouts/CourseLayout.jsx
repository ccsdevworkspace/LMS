import { Outlet } from 'react-router-dom'

export default function CourseLayout() {
  return (
    <main className="flex flex-col h-dvh">
      <section className="flex-1 w-full">
        <Outlet />
      </section>
    </main>
  )
}
