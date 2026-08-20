import { Plus, LogIn } from 'lucide-react'
import CourseCard from './CourseCard'


export default function CourseGrid({ courses, onCreateClick, onJoinClick }) {
  return (
    <main className='flex flex-col gap-6'>
      <header className='flex items-center justify-end gap-2'>
        <button 
        title='Create Course'
        onClick={onCreateClick}  
        className='flex justify-center items-center w-10 h-10 rounded-xl bg-primary-600 text-fg-inverse dark:text-fg hover:bg-primary-600/90 cursor-pointer'>
          <Plus size={18} strokeWidth={2} />
        </button>

        <button 
        title='Join Course' 
        onClick={onJoinClick} 
        className='flex justify-center items-center w-10 h-10 rounded-xl border border-border/67 bg-primary-100 text-primary-600 hover:bg-primary-100/80 cursor-pointer'>
          <LogIn size={18} strokeWidth={2} />
        </button>
      </header>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  )
}
