import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MoreVertical, Trash2, ChevronLeft, Download, FileDown, User, Clock, Lock, Unlock } from 'lucide-react'
import { useTaskStore } from '../../stores/task'
import { useCourseStore } from '../../stores/course'
import { useUserStore } from '../../stores/user'
import Loading from '../app/Loading'
import Modal from '../app/Modal'
import Error from '../../pages/Error'
import StudentSubmission from './StudentSubmission'
import { getTaskType, formatDate, getFileName } from './taskTypes'

function TaskAttachments({ attachments }) {
  if (!attachments?.length) return null

  const attachmentItems = attachments.map((fileUrl, index) => (
    <div
      key={index}
      className="flex justify-between items-center p-4 bg-card border border-border rounded-xl hover:border-border-hover transition"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex justify-center items-center w-11 h-11 rounded-xl shrink-0 bg-primary-600/10 text-primary-600 dark:text-primary-400">
          <FileDown size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-fg truncate">{getFileName(fileUrl)}</span>
          <span className="text-xs text-fg-muted">Attachment {index + 1}</span>
        </div>
      </div>

      <a
        href={fileUrl}
        target="_blank"
        download
        className="p-2 text-fg-muted hover:text-primary-600 transition shrink-0 ml-3"
        title="Download resource"
      >
        <Download size={18} />
      </a>

    </div>
  ))

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-fg">Resources</h3>
      <div className="flex flex-col gap-3">
        {attachmentItems}
      </div>
    </section>
  )
}

function TeacherSubmissionsPanel({ summary, courseId, taskId }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-base font-bold text-fg">Submissions</h3>
      <div className="flex justify-between items-center bg-card border border-border rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex justify-center items-center rounded-xl w-11 h-11 bg-primary-600/10 text-primary-600 dark:text-primary-400">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-fg">{summary?.submittedCount ?? 0}</span>
              <span className="text-xs text-fg-muted">Submitted</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex justify-center items-center rounded-xl w-11 h-11 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-fg">{summary?.pendingCount ?? 0}</span>
              <span className="text-xs text-fg-muted">Pending</span>
            </div>
          </div>
        </div>

        <Link
          to={`/courses/${courseId}/task/${taskId}/submissions`}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-fg hover:bg-muted transition cursor-pointer"
        >
          Open Submissions
        </Link>
      </div>
    </section>
  )
}

export default function TaskDetail() {
  const { id: courseId, taskId } = useParams()
  const navigate = useNavigate()

  const {
    fetchTask,
    currentTask,
    submission,
    submissions,
    fetchSubmissions,
    updateTask,
    deleteTask,
    loading,
  } = useTaskStore()
  const { getCourse, currentCourse } = useCourseStore()
  const profile = useUserStore((s) => s.profile)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (courseId) getCourse(courseId)
  }, [courseId, getCourse])

  useEffect(() => {
    if (taskId) fetchTask(taskId)
  }, [taskId, fetchTask])

  useEffect(() => {
    if (currentTask?.createdById === profile?.id && taskId) fetchSubmissions(taskId)
  }, [currentTask, profile, taskId, fetchSubmissions])

  const isTeacher = currentTask?.createdById === profile?.id

  if (loading && !currentTask) {
    return (
      <div className="flex justify-center items-center p-8 h-full">
        <Loading />
      </div>
    )
  }

  if (!currentTask) {
    return <Error />
  }

  const { icon: Icon, badge } = getTaskType(currentTask.type)
  const subjectName = currentCourse?.name || 'SUBJECT'
  const date = formatDate(currentTask.deadline)
  const isPublished = currentTask.status === 'PUBLISHED'

  const handleTogglePublish = async () => {
    setActionError(null)
    try {
      await updateTask(taskId, { status: isPublished ? 'DRAFT' : 'PUBLISHED' })
    } catch (err) {
      setActionError(err?.response?.data?.error || err?.message || 'Failed to update task')
    }
  }

  const handleDelete = async () => {
    setActionError(null)
    try {
      await deleteTask(taskId)
      setIsDeleteModalOpen(false)
      navigate(`/courses/${courseId}/task`)
    } catch (err) {
      setActionError(err?.response?.data?.error || err?.message || 'Failed to delete')
    }
  }

  const handleMenuBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsMenuOpen(false)
  }

  return (
    <main className="max-w-3xl mx-auto w-full p-6 sm:p-6 lg:p-12 flex flex-col gap-8">
      <div className="flex justify-between items-center" onBlur={handleMenuBlur}>
        <Link
          to={`/courses/${courseId}/task`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase"
        >
          <ChevronLeft size={18}/>
          {subjectName}
        </Link>

        {isTeacher && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl border border-border bg-card text-fg-muted hover:text-fg hover:border-border-hover transition cursor-pointer"
              title="More actions"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-34 rounded-xl border border-border bg-modal p-1.5 shadow-xl z-20 flex flex-col gap-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleTogglePublish()
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-fg rounded-lg hover:bg-muted transition text-left disabled:opacity-50 cursor-pointer"
                >
                  {isPublished ? <Lock size={15} /> : <Unlock size={15} />}
                  <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsDeleteModalOpen(true)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger rounded-lg hover:bg-danger/10 transition text-left cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <header className="-mt-3 flex justify-between items-start border-b border-border pb-6 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`flex justify-center items-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 ${badge}`}>
            <Icon size={26} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-fg tracking-tight truncate">
              {currentTask.title}
            </h1>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              {currentTask.totalPoints != null && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-600/10 text-primary-600 dark:text-primary-400">
                  {currentTask.totalPoints} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {date && (
          <span className="font-semibold text-fg-muted text-xs sm:text-sm shrink-0 self-center">{date}</span>
        )}
      </header>

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-bold text-fg">Instructions</h3>
        <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-line wrap-break-word">
          {currentTask.instructions || 'No instructions provided.'}
        </p>
      </section>

      <TaskAttachments attachments={currentTask.attachments} />

      {isTeacher ? (
        <TeacherSubmissionsPanel
          summary={submissions?.task?.id === taskId ? submissions.summary : null}
          courseId={courseId}
          taskId={taskId}
        />
      ) : (
        <StudentSubmission
          taskId={taskId}
          submission={submission}
          totalPoints={currentTask.totalPoints}
        />
      )}

      {actionError && <p className="text-sm text-danger">{actionError}</p>}

      <Modal
        open={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
        subtitle="Are you sure?"
        fullScreen={false}
      >
        <div className="flex justify-end items-center gap-3 pt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="font-bold text-sm text-fg px-5 py-2.5 transition hover:opacity-70"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleDelete}
            className="rounded-xl text-sm bg-danger font-bold text-fg-inverse px-7 py-2.5 transition hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </main>
  )
}
