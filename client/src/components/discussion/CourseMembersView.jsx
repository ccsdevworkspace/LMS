import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Copy, Check, MoreVertical, UserMinus } from 'lucide-react'
import { useCourseStore } from '../../stores/course'
import { useUserStore } from '../../stores/user'
import Loading from '../app/Loading'

function MemberAvatar({ avatarUrl, fullName }) {
  const [imgError, setImgError] = useState(false)

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'User'}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-fg-subtle bg-muted">
      {fullName?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function CourseMembersView() {
  const { id } = useParams()
  const { getCourse, currentCourse, getMembers, members, removeMember, loading } = useCourseStore()
  const profile = useUserStore((s) => s.profile)
  const [copied, setCopied] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (id) {
      getCourse(id).catch(console.error)
      getMembers(id).catch(console.error)
    }
  }, [id, getCourse, getMembers])

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-menu-container]')) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleCopyCode = async () => {
    if (!currentCourse?.joinCode) return
    try {
      await navigator.clipboard.writeText(currentCourse.joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this student from the course?')) return
    try {
      setRemovingId(userId)
      await removeMember(id, userId)
      setMenuOpenId(null)
    } catch (err) {
      console.error('Failed to remove member:', err)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading && !currentCourse) {
    return <Loading />
  }

  const isTeacher = currentCourse?.createdById === profile?.id

  // Students list (exclude instructor)
  const students = members
    .map((m) => m.user ?? m)
    .filter((u) => u.id !== currentCourse?.createdById && u.id !== currentCourse?.createdBy?.id)

  const studentCount = students.length

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col gap-8">
      {/* Top Back Navigation */}
      <nav>
        <Link
          to={`/courses/${id}/discussion`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-600/80 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          CHAT
        </Link>
      </nav>

      {/* Header */}
      <header className="-mt-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fg tracking-tight">
          Members
        </h1>
        <p className="text-sm font-medium text-fg-muted mt-1">
          {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
        </p>
      </header>

      {/* Course Code Card */}
      <div className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle block mb-1">
            Course Code
          </span>
          <span className="text-xl font-extrabold text-fg tracking-wider font-mono">
            {currentCourse?.joinCode || '------'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-fg-muted hover:border-border-hover hover:bg-muted active:scale-95 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Instructor Section */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-fg">Instructor</h2>
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
            <MemberAvatar
              avatarUrl={currentCourse?.createdBy?.avatarUrl}
              fullName={currentCourse?.createdBy?.fullName}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-fg truncate">
              {currentCourse?.createdBy?.fullName || 'Instructor'}
            </span>
            <span className="text-xs text-fg-subtle font-medium">Instructor</span>
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-fg">Students</h2>
        {students.length === 0 ? (
          <div className="p-8 text-center text-sm text-fg-subtle bg-card border border-border rounded-2xl">
            No students enrolled yet.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-visible shadow-sm">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                    <MemberAvatar
                      avatarUrl={student.avatarUrl}
                      fullName={student.fullName}
                    />
                  </div>
                  <span className="text-sm font-bold text-fg truncate">
                    {student.fullName || 'Student'}
                  </span>
                </div>

                {/* 3-dots Menu Button */}
                <div className="relative" data-menu-container>
                  <button
                    type="button"
                    onClick={() =>
                      setMenuOpenId(menuOpenId === student.id ? null : student.id)
                    }
                    className="p-2 text-fg-subtle hover:text-fg hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Options"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpenId === student.id && (
                    <div className="absolute right-0 mt-1 w-44 bg-modal border border-border rounded-xl shadow-lg z-30 py-1 text-sm overflow-hidden">
                      {isTeacher ? (
                        <button
                          type="button"
                          disabled={removingId === student.id}
                          onClick={() => handleRemove(student.id)}
                          className="w-full px-4 py-2.5 text-left text-danger hover:bg-danger/10 flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <UserMinus size={15} />
                          {removingId === student.id ? 'Removing...' : 'Remove Student'}
                        </button>
                      ) : (
                        <div className="px-4 py-2 text-xs text-fg-subtle">
                          Enrolled Student
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
