import Grid from '../components/dashboard/Grid';
import { quoteOfTheDay } from '../components/dashboard/quotes'
import { useTaskStore } from '../stores/task'
import { useEffect } from 'react'

export default function Dashboard() {
  const quote = quoteOfTheDay()
  const latestTask = useTaskStore((s) => s.latestTask)
  const fetchLatestTask = useTaskStore((s) => s.fetchLatestTask)

  useEffect(() => {
    fetchLatestTask()
  }, [fetchLatestTask])

  return (
  <main className="flex flex-col mt-12">
    <section className="flex-1 p-6 sm:p-12 lg:p-18">
      <Grid 
      quote={quote} 
      task={latestTask}
      />
    </section>
  </main>
  )
}