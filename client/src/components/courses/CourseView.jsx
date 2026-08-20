import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCourseStore } from '../../stores/course'
import { useUserStore } from '../../stores/user'
import Loading from '../app/Loading'
import Modal from '../app/Modal'
import EmptyState from '../app/EmptyState'
import { BookX,  ArrowRight, ChevronLeft,  Trash2,  LogOut, ClipboardList, ChevronRight, MessageSquare, Folder } from 'lucide-react'
import SuccessScreen from './SuccessScreen'
import ConfirmAction from './ConfirmAction'

export default function CourseView() {
  const { id } = useParams()
  const { getCourse, currentCourse, loading, leaveCourse, deleteCourse } = useCourseStore()
  const profile = useUserStore((s) => s.profile)
  const navigate = useNavigate()
  const [goneCourse, setGoneCourse] = useState(null)

  useEffect(() => {
    const getCourseById = async () => {
      try {
        await getCourse(id)
      } catch (error) {
        console.error(error)
      }
    }
    getCourseById()
  }, [id, getCourse])

  if (goneCourse) {
    return (
      <Modal 
      open 
      fullScreen={false} 
      closeModal={() => navigate('/courses')}
      >
        <SuccessScreen 
        action={goneCourse.action} 
        course={goneCourse.course} 
        onDone={() => navigate('/courses')}
        />
      </Modal>
    )
  }

  if (!currentCourse) {
    return loading ? (
      <Loading />
    ) : (
      <EmptyState
        icon={BookX}
        title="Course"
        accent="Not Found"
        description="Please try again or return to your courses."
        descriptionClassName="text-sm sm:text-base text-fg-disabled tracking-tight w-67"
      >
        <div className="flex w-62 flex-col gap-3 sm:flex-row">
          <Link
            to='/courses'
            className="group flex flex-1 justify-center  items-center p-3 rounded-xl bg-primary-600 gap-2 text-sm font-medium text-fg-inverse transition-all duration-200 hover:bg-btn-hover active:scale-95 dark:text-fg">
            Back to my courses
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1.5 group-active:translate-x-2"
            />
          </Link>
        </div>
      </EmptyState>
    )
  }

  const isTeacher = currentCourse.createdById === profile?.id

  return (
    <main className="max-w-3xl mx-auto w-full p-6 sm:p-6 lg:p-12 flex flex-col gap-10">
      <nav>
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-600 transition-colors">
          <ChevronLeft size={18}/>
          COURSES
        </Link>
      </nav>

      <header className="-mt-4 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-fg tracking-tight mb-2">
            {currentCourse.name}
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-fg-muted">
            {currentCourse.section}
          </p>
        </div>
        {isTeacher ? (
          <ConfirmAction
            icon={Trash2}
            label="Delete"
            title="Delete Course"
            subtitle="Are you sure?"
            confirmLabel="Delete"
            loadingLabel="Deleting..."
            onConfirm={async () => {
              await deleteCourse(currentCourse.id)
              setGoneCourse({ action: 'deleted', course: currentCourse })
            }}
          />
        ) : (
          <ConfirmAction
            icon={LogOut}
            label="Leave"
            title="Leave Course"
            subtitle="Are you sure?"
            confirmLabel="Leave"
            loadingLabel="Leaving..."
            onConfirm={async () => {
              await leaveCourse(currentCourse.id)
              setGoneCourse({ action: 'left', course: currentCourse })
            }}
          />
        )}
      </header>

      <section className="flex flex-col-reverse sm:flex-row justify-between items-center sm:items-stretch bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm gap-8">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left justify-center max-w-sm">
          <p className="text-sm font-semibold text-fg-muted mb-2">Today's Classroom</p>
          <h2 className="text-3xl font-bold text-fg mb-3">Live Classroom</h2>
          <p className="text-sm text-fg-subtle mb-8 leading-relaxed">
            {isTeacher 
              ? "Start a live class whenever you're ready."
              : "Access your live classes from here."}
          </p>
          
          <Link to={`/courses/${currentCourse.id}/video`}
          className="bg-primary-600 active:scale-95 text-fg-inverse dark:text-fg px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer hover:bg-btn-hover">
            {isTeacher ? "Create Live Class" : "Join Live Class"}
          </Link>
        </div>
        
        <figure className="flex justify-center items-center drop-shadow-lg w-32 sm:w-48">
          <img src="/video.webp" className="w-full h-auto object-contain"/>
        </figure>
      </section>

      <nav className="flex flex-col gap-4">
        <Link to={`/courses/${currentCourse.id}/task`} 
        className="group flex items-center justify-between p-6 bg-card border border-border rounded-2xl hover:border-border-hover hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 shrink-0 bg-primary-600/10 rounded-xl text-primary-600">
              <ClipboardList size={26} strokeWidth={2.5}/>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-extrabold text-fg">Task</h3>
              <p className="text-sm text-fg-muted">
                {isTeacher 
                  ? "Create and manage assignments and tests."
                  : "View your assignments and tests."}
              </p>
            </div>
          </div>
          <ChevronRight className="text-border group-hover:text-fg-muted shrink-0" size={24} />
        </Link>
        
        <Link to={`/courses/${currentCourse.id}/discussion`} 
        className="group flex items-center justify-between p-6 bg-card border border-border rounded-2xl hover:border-border-hover hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 shrink-0 bg-primary-600/10 rounded-xl text-primary-600">
              <MessageSquare size={26} strokeWidth={2.5}/>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-extrabold text-fg">Discussions</h3>
              <p className="text-sm text-fg-muted">
                {isTeacher 
                  ? "Chat with students, share announcements, and more."
                  : "Join conversations, ask questions and see announcements."}
              </p>
            </div>
          </div>
          <ChevronRight className="text-border group-hover:text-fg-muted shrink-0" size={24}/>
        </Link>

        <Link to={`/courses/${currentCourse.id}/resources`}
        className="group flex items-center justify-between p-6 bg-card border border-border rounded-2xl hover:border-border-hover hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 shrink-0 bg-primary-600/10 rounded-xl text-primary-600">
              <Folder size={26} strokeWidth={2.5}/>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-extrabold text-fg">Resources</h3>
              <p className="text-sm text-fg-muted">
                {isTeacher 
                  ? "Upload and manage course materials and files."
                  : "Access course materials and files anytime."}
              </p>
            </div>
          </div>
          <ChevronRight className="text-border group-hover:text-fg-muted shrink-0" size={24}/>
        </Link>

      </nav>
    </main>
  )
}
