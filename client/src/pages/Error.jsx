import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Error() {
  return (
    <main className="flex justify-center items-center overflow-hidden p-6 sm:p-10 lg:p-16 fixed inset-0">
      <div className="flex flex-col-reverse justify-between items-center w-full max-w-5xl gap-12 sm:flex-row sm:gap-16">
        <section className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h1 className="text-5xl font-black tracking-tight text-fg sm:text-6xl lg:text-7xl">
            Made it <br /> this far.
          </h1>
          
          <p className="mt-3 text-3xl text-primary-600 lg:text-4xl">
            Now, where to?
          </p>
          
          <p className="mt-4 text-base text-fg-subtle sm:text-lg">
            We couldn't find this page. Let's get you back.
          </p>

          <Link
          to="/dashboard"
          className="group mt-8 inline-flex items-center gap-2.5 rounded-xl bg-primary-600 px-7 py-3.5 text-base font-semibold text-fg-inverse shadow-md transition-all duration-200 hover:bg-btn-hover active:scale-95 dark:text-fg"
          >
          Go to Main Page
          <ArrowRight 
            size={20} 
            className="transition-transform duration-200 group-hover:translate-x-1.5 group-active:translate-x-2" 
          />
          </Link>
        </section>

        <figure className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl sm:flex-1 shrink-0">
          <img 
            src="/error.webp" 
            className="h-auto w-full object-contain drop-shadow-lg" 
          />
        </figure>
      </div>
    </main>
  )
}