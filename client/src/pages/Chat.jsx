import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCourseStore } from '../stores/course'
import { MessageSquare, ArrowRight, BookOpen } from 'lucide-react'
import Loading from '../components/app/Loading'

export default function Chat() {
  const { courses, fetchCourses, loading } = useCourseStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses().catch(console.error)
  }, [fetchCourses])

  if (loading && courses.length === 0) {
    return <Loading />
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold text-fg tracking-tight">Discussions</h1>
        <p className="text-sm text-fg-muted mt-1">
          Select a course to view and participate in class discussions.
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center mb-4">
            <BookOpen size={26} />
          </div>
          <h2 className="text-lg font-bold text-fg mb-1">No courses found</h2>
          <p className="text-sm text-fg-muted mb-6 max-w-sm">
            Join or create a course to access its discussions.
          </p>
          <Link
            to="/courses"
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-fg-inverse hover:bg-btn-hover font-semibold text-sm transition-all"
          >
            Go to Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}/discussion`}
              className="group p-6 bg-card border border-border rounded-2xl hover:border-border-hover hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600/10 text-primary-600 flex items-center justify-center shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-fg group-hover:text-primary-600 transition-colors truncate">
                    {course.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider font-semibold text-fg-muted mt-0.5">
                    {course.section || 'General'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-primary-600 pt-2 border-t border-border/50">
                <span>Open discussion</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}