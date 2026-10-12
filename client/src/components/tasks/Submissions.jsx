import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, User, FileText, House } from 'lucide-react'
import { useTaskStore } from '../../stores/task'
import { getFileName, formatDateTime } from './taskTypes'
import SubmissionGradeForm from './SubmissionGradeForm'
import Loading from '../app/Loading'
import EmptyState from '../app/EmptyState'

function SubmissionDetails({ submission }) {
  if (!submission) {
    return (
      <section className="flex h-full flex-col justify-center items-center p-8 text-center rounded-xl">
        <p className="text-xs font-semibold text-fg-muted">
          No submissions yet
        </p>
      </section>
    )
  }

  const attachmentItems = submission.attachments.map((fileUrl, index) => (
    <div
      key={fileUrl}
      className="flex justify-between items-center p-3.5 rounded-xl border border-border bg-surface hover:border-border-hover transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex justify-center items-center w-9 h-9 rounded-lg bg-primary-600/10 text-primary-600 shrink-0">
          <FileText size={18} />
        </div>
        <span className="text-xs font-bold text-fg truncate">
          {getFileName(fileUrl) || `Submission File ${index + 1}`}
        </span>
      </div>
      <a
        href={fileUrl}
        target="_blank"
        className="p-2 text-fg-muted hover:text-primary-600 transition"
        title="Open File"
      >
        <FileText size={16} />
      </a>
    </div>
  ))

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <h3 className="text-sm font-bold text-fg">Submission</h3>
      <div className="flex min-h-0 flex-1 flex-col gap-3.5">
        {submission.attachments?.length > 0 && (
          <div className="flex flex-col gap-2">
            {attachmentItems}
          </div>
        )}
        {submission.content && (
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold text-fg-muted">Written Response:</span>
            <div className="flex-1 min-h-40 overflow-y-auto whitespace-pre-line p-3.5 rounded-xl border border-border bg-surface text-sm leading-relaxed text-fg wrap-break-word">
              {submission.content}
            </div>
          </div>
        )}
        {!submission.attachments?.length && !submission.content && (
          <p className="text-xs text-fg-muted">Nothing was submitted for this task.</p>
        )}
      </div>
    </div>
  )
}

function StudentList({ students, activeStudentId, onSelect }) {
  if (students.length === 0) {
    return <div className="flex flex-1 justify-center items-center p-8 text-center text-xs text-fg-muted">No students to display</div>
  }

  const studentItems = students.map((student) => {
    const isSelected = student.id === activeStudentId
    const submission = student.submission

    return (
      <button
        key={student.id}
        onClick={() => onSelect(student.id)}
        className={`w-full flex justify-between items-center p-3.5 sm:p-4 text-left transition cursor-pointer ${
          isSelected
            ? 'bg-primary-600/10 font-bold'
            : 'hover:bg-surface'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={student.fullName}
              className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex justify-center items-center text-[10px] font-bold text-fg-muted shrink-0">
              {student.fullName?.slice(0, 2).toUpperCase() || <User size={14} />}
            </div>
          )}
          <span className="text-xs font-semibold text-fg truncate">{student.fullName}</span>
        </div>
        <div className="shrink-0 ml-3">
          {submission?.status === 'GRADED' ? (
            <span className="text-xs font-bold text-success">{submission.score ?? 0} pts</span>
          ) : submission ? (
            <span className="text-[11px] font-bold text-primary-600 bg-primary-600/10 px-2 py-0.5 rounded-full">Submitted</span>
          ) : (
            <span className="text-xs text-fg-subtle">Pending</span>
          )}
        </div>
      </button>
    )
  })

  return (
    <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
      {studentItems}
    </div>
  )
}

export default function Submissions() {
  const { id: courseId, taskId } = useParams()
  const { submissions, fetchSubmissions, loading } = useTaskStore()
  const [activeTab, setActiveTab] = useState('All')
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  useEffect(() => {
    if (taskId) fetchSubmissions(taskId)
  }, [taskId, fetchSubmissions])

  const task = submissions?.task
  const summary = submissions?.summary || {
    totalMembers: 0,
    submittedCount: 0,
    pendingCount: 0,
    gradedCount: 0,
    needsGradingCount: 0,
  }
  const allStudents = submissions?.students || []

  const filteredStudents = allStudents.filter((st) => {
    const sub = st.submission
    if (activeTab === 'Submitted') return Boolean(sub)
    if (activeTab === 'Pending') return !sub
    if (activeTab === 'Needs Grading') return sub?.status === 'SUBMITTED'
    if (activeTab === 'Graded') return sub?.status === 'GRADED'
    return true
  })

  const activeStudent = filteredStudents.find((s) => s.id === selectedStudentId) || filteredStudents[0]
  const currentSubmission = activeStudent?.submission
  const currentIndex = filteredStudents.findIndex((s) => s.id === activeStudent?.id)

  if (loading && !submissions) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <Loading />
      </div>
    )
  }

  if (allStudents.length === 0) {
    return (
    <main className="max-w-8xl mx-auto w-full p-6 sm:p-6 lg:p-12 flex flex-col gap-6 lg:h-full lg:min-h-0">
        <nav>
          <Link
            to={`/courses/${courseId}/task/${taskId}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ChevronLeft size={18} />
            TASK
          </Link>
        </nav>
        <EmptyState
          icon={User}
          title="No submissions"
          accent="Yet"
          description="No students are enrolled in this course at the moment"
        />
      </main>
    )
  }

  const tabs = [
    { label: 'All', count: summary.totalMembers },
    { label: 'Submitted', count: summary.submittedCount },
    { label: 'Pending', count: summary.pendingCount },
    { label: 'Needs Grading', count: summary.needsGradingCount },
    { label: 'Graded', count: summary.gradedCount },
  ]

  const tabButtons = tabs.map((tab) => {
    const isActive = activeTab === tab.label
    return (
      <button
        key={tab.label}
        onClick={() => setActiveTab(tab.label)}
        className={`px-2.5 sm:px-4 py-2 rounded-xl text-[11px] md:text-xs font-bold whitespace-nowrap transition cursor-pointer ${
          isActive
            ? 'bg-primary-600/10 text-primary-600 border border-primary-600/30'
            : 'text-fg-muted hover:text-fg hover:bg-surface border border-transparent'
        }`}
      >
        {tab.label}
        {tab.count > 0 && <span className="text-fg-subtle font-medium"> ({tab.count})</span>}
      </button>
    )
  })

  return (
    <main className="max-w-8xl mx-auto w-full p-6 sm:p-6 lg:p-12 flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex justify-between items-center">
          <Link
            to={`/courses/${courseId}/task/${taskId}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase"
          >
            <ChevronLeft size={18} />
            {`Submissions`}
          </Link>
          <Link
            to="/courses"
            title="Back to courses"
            className="p-2 rounded-xl border border-border bg-card text-fg-muted hover:text-fg hover:border-border-hover transition"
          >
            <House size={18} />
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <section>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">{task.title}</h1>
            <p className="text-xs text-fg-muted font-semibold mt-1">
              {summary.totalMembers} Students
            </p>
          </section>

          <div className="self-center flex flex-wrap items-center gap-1 sm:flex-nowrap sm:gap-1.5 ml-auto">
            {tabButtons}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch lg:flex-1 lg:min-h-0">
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-95 min-w-0 lg:min-h-0 rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {activeStudent ? (
            <>
              <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border bg-surface/50">
                <div className="flex items-center gap-3.5 min-w-0">
                  {activeStudent.avatarUrl ? (
                    <img
                      src={activeStudent.avatarUrl}
                      alt={activeStudent.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-600/10 text-primary-600 dark:text-primary-400 flex justify-center items-center font-bold text-sm shrink-0 border border-border">
                      {activeStudent.fullName?.slice(0, 2).toUpperCase() || <User size={20} />}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-fg truncate">
                      {activeStudent.fullName}
                    </span>
                    <span className="text-xs text-fg-muted font-medium">
                      {currentSubmission?.submittedAt
                        ? `Submitted ${formatDateTime(currentSubmission.submittedAt)}`
                        : 'Not submitted yet'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    disabled={currentIndex <= 0}
                    onClick={() => setSelectedStudentId(filteredStudents[currentIndex - 1]?.id)}
                    className="p-2 rounded-xl border border-border bg-card text-fg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Previous Student"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-xs font-bold text-primary-600">
                    {filteredStudents.length > 0 ? `${currentIndex + 1} of ${filteredStudents.length}` : '0 of 0'}
                  </span>

                  <button
                    disabled={currentIndex >= filteredStudents.length - 1}
                    onClick={() => setSelectedStudentId(filteredStudents[currentIndex + 1]?.id)}
                    className="p-2 rounded-xl border border-border bg-card text-fg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Next Student"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div
                className={`flex-1 min-h-0 grid grid-cols-1 gap-6 sm:gap-8 p-5 sm:p-6 ${
                  currentSubmission ? 'md:grid-cols-2' : ''
                }`}
              >
                <SubmissionDetails submission={currentSubmission} />

                {currentSubmission && (
                  <SubmissionGradeForm
                    key={activeStudent.id}
                    task={task}
                    studentId={activeStudent.id}
                    submission={currentSubmission}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 justify-center items-center p-12 text-center text-xs text-fg-muted">
              No submissions to review
            </div>
          )}
        </section>

        <section className="lg:col-span-5 xl:col-span-4 rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col h-full min-h-95 lg:min-h-0">
          <div className="p-4 border-b border-border bg-surface/50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">Students</span>
            <span className="text-xs font-bold text-fg">{filteredStudents.length}</span>
          </div>

          <StudentList
            students={filteredStudents}
            activeStudentId={activeStudent?.id}
            onSelect={setSelectedStudentId}
          />
        </section>
      </div>
    </main>
  )
}
