import { useCourseStore } from '../stores/course'
import { useEffect, useState } from 'react'
import { Plus, LogIn, GraduationCap } from 'lucide-react'
import Loading from '../components/app/Loading'
import EmptyState from '../components/app/EmptyState'
import CourseGrid from '../components/courses/CourseGrid'
import CreateCourseModal from '../components/courses/CreateCourseModal'
import JoinCourseModal from '../components/courses/JoinCourseModal'

export default function Courses() {
  const fetchCourses = useCourseStore((s) => s.fetchCourses)
  const courses = useCourseStore((s) => s.courses)
  const loading = useCourseStore((s) => s.loading)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return (
    <>
    {loading && courses.length === 0 ? <Loading /> : courses.length === 0 ? (
      <EmptyState
      icon={GraduationCap}
      title="No"
      accent="Courses Yet"
      description="Create or join"
      >
        <section className="flex flex-col w-full gap-3 sm:flex-row">
          <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="flex flex-1 justify-center items-center  gap-2 rounded-xl bg-primary-600 p-3 text-sm font-medium text-fg-inverse hover:bg-primary-600/90 dark:text-fg">
            <Plus size={18} /> Create Course
          </button>

          <button 
          onClick={() => setIsJoinModalOpen(true)} 
          className="flex flex-1 justify-center items-center gap-2 rounded-xl border border-border/60 bg-primary-100 p-3 text-sm font-medium text-primary-600 hover:bg-primary-100/80">
            <LogIn size={18} /> Join Course
          </button>
        </section>
      </EmptyState>
      ) : (
      <main className="flex flex-col mt-12">
        <section className="flex-1 p-6 sm:p-12 lg:p-18">
          <CourseGrid 
          courses={courses} 
          onCreateClick={() => setIsCreateModalOpen(true)}
          onJoinClick={() => setIsJoinModalOpen(true)}
          />
        </section>
      </main>
    )}
    
    <CreateCourseModal 
    open={isCreateModalOpen} 
    closeModal={() => setIsCreateModalOpen(false)} 
    />
    
    <JoinCourseModal 
    open={isJoinModalOpen} 
    closeModal={() => setIsJoinModalOpen(false)} 
    />
    </>
  )
}