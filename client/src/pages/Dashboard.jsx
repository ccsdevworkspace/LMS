import Grid from '../components/dashboard/Grid';
import { quoteOfTheDay } from '../components/dashboard/quotes'

export default function Dashboard() {
  const quote = quoteOfTheDay()

  return (
  <main className="flex flex-col mt-12">
    <section className="flex-1 p-6 sm:p-12 lg:p-18">
      <Grid quote={quote} />
    </section>
  </main>
  )
}