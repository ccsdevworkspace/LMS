import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTaskStore } from '../../stores/task'
import { useCourseStore } from '../../stores/course'
import { useUserStore } from '../../stores/user'
import Modal from '../app/Modal'
import Loading from '../app/Loading'
import EmptyState from '../app/EmptyState'
import { TASK_TYPES, getTaskType, formatDate, isOverdue } from './taskTypes'

function TaskCard({ task, courseId, subjectName }) {
  const { icon: Icon, badge } = getTaskType(task.type)
  const date = formatDate(task.deadline)

  return (
    <Link
      to={`/courses/${courseId}/task/${task.id}`}
      className="group flex justify-between items-center bg-card border border-border p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:border-border-hover hover:shadow-sm"
    >
      <section className="flex items-center gap-4 sm:gap-5 min-w-0">
        <div className={`flex justify-center items-center w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl ${badge}`}>
          <Icon size={24} strokeWidth={2.2} />
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-fg truncate">
            {task.title || 'Untitled'}
          </h3>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 truncate">
            {subjectName}
          </p>
        </div>
      </section>

      <section className="flex items-center gap-3 shrink-0 ml-4">
        <div className="flex flex-col items-end gap-0.5">
          {task.status === 'DRAFT' ? (
            <span className="text-xs sm:text-sm font-semibold text-fg-subtle">Draft</span>
          ) : isOverdue(task) ? (
            <span className="text-xs sm:text-sm font-semibold text-danger">Closed</span>
          ) : null}
          {date && (
            <span className="text-xs sm:text-sm text-fg-disabled font-medium">{date}</span>
          )}
        </div>
        <ChevronRight size={20} className="text-border group-hover:text-fg-muted transition-colors" />
      </section>
    </Link>
  )
}

function TaskTypeModal({ open, closeModal, courseId }) {
  const [selectedType, setSelectedType] = useState('ASSIGNMENT')
  const navigate = useNavigate()

  const handleContinue = () => {
    closeModal()
    navigate(`/courses/${courseId}/task/create?type=${selectedType.toLowerCase()}`)
  }

  const typeOptions = Object.entries(TASK_TYPES).map(([type, item]) => {
    const Icon = item.icon
    const isSelected = selectedType === type

    return (
      <button
        key={type}
        onClick={() => setSelectedType(type)}
        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'border-primary-600 bg-primary-600/5 shadow-xs'
            : 'border-border bg-card hover:border-border-hover'
        }`}
      >
        <div className={`flex justify-center items-center rounded-xl w-12 h-12 shrink-0 ${item.badge}`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>

        <div className="flex flex-col min-w-0">
          <h4 className="text-base font-bold text-fg">{item.label}</h4>
          <p className="text-xs text-fg-muted truncate">{item.description}</p>
        </div>
      </button>
    )
  })

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Create Task"
      subtitle="Choose a task type"
      fullScreen={false}
    >
      <div className="flex flex-col gap-3 py-1">
        {typeOptions}
      </div>

      <div className="flex justify-end items-center gap-3 pt-6 mt-2">
        <button
          onClick={closeModal}
          className="text-sm font-bold text-fg px-5 py-2.5 transition hover:opacity-70"
        >
          Cancel
        </button>

        <button
          onClick={handleContinue}
          className="text-sm font-bold rounded-xl bg-btn px-7 py-2.5 text-fg-inverse dark:text-fg transition hover:bg-btn-hover active:scale-95 cursor-pointer shadow-sm"
        >
          Continue
        </button>
      </div>
    </Modal>
  )
}

export default function Tasks() {
  const { id: courseId } = useParams()
  const { courseTasks: tasks, fetchCourseTasks: fetchTasks, isLoadingCourseTasks: loading } = useTaskStore()
  const { getCourse, currentCourse } = useCourseStore()
  const profile = useUserStore((s) => s.profile)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)

  useEffect(() => {
    if (!courseId) return
    fetchTasks(courseId)
    getCourse(courseId)
  }, [courseId, fetchTasks, getCourse])

  const isTeacher = currentCourse?.createdById === profile?.id
  const subjectName = currentCourse?.name || 'SUBJECT'

  const visible = isTeacher ? tasks : tasks.filter((task) => task.status !== 'DRAFT')

  const taskCards = visible.map((task) => (
    <TaskCard key={task.id} task={task} courseId={courseId} subjectName={subjectName} />
  ))

  const newTaskButton = (
    <button
      onClick={() => setIsTypeModalOpen(true)}
      className="flex items-center rounded-xl bg-btn gap-2 px-5 sm:px-6 py-2.5 text-sm font-bold text-fg-inverse dark:text-fg transition hover:bg-btn-hover active:scale-95 cursor-pointer shadow-sm"
    >
      <Plus size={18} strokeWidth={2.5} />
      <span>New Task</span>
    </button>
  )

  const isEmpty = !(loading && tasks.length === 0) && visible.length === 0

  return (
    <main className={`max-w-3xl mx-auto w-full p-6 sm:p-6 lg:p-12 flex flex-col gap-10 ${isEmpty ? 'h-full' : ''}`}>
      <nav>
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase"
        >
          <ChevronLeft size={18}/>
          {subjectName}
        </Link>
      </nav>

      <header className="flex justify-between items-center gap-4 -mt-4">
        <h1 className="text-4xl font-extrabold text-fg tracking-tight">Task</h1>
        {isTeacher && newTaskButton}
      </header>

      {loading && tasks.length === 0 ? (
        <Loading />
      ) : visible.length > 0 ? (
        <div className="flex flex-col gap-4">
          {taskCards}
        </div>
      ) : (
        <div className="flex-1">
          <EmptyState
            icon={ClipboardList}
            title="No Tasks"
            accent="Yet"
            description={
              isTeacher
                ? 'Create a task to get started'
                : 'No tasks assigned yet'
            }
          >
            {isTeacher && newTaskButton}
          </EmptyState>
        </div>
      )}

      <TaskTypeModal
        open={isTypeModalOpen}
        closeModal={() => setIsTypeModalOpen(false)}
        courseId={courseId}
      />
    </main>
  )
}
