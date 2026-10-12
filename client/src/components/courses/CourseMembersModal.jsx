import { useEffect, useState } from 'react'
import { useCourseStore } from '../../stores/course'
import { X, Search, UserMinus, Users } from 'lucide-react'

const TABS = ['All', 'Instructors', 'Students']

function MemberAvatar({ avatarUrl, fullName }) {
  const [imgError, setImgError] = useState(false)

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-fg-subtle">
      {fullName?.[0] ?? '?'}
    </div>
  )
}

export default function CourseMembersModal({ open, onClose, course, isTeacher }) {
  const { getMembers, removeMember, members, loading } = useCourseStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [removingId, setRemovingId] = useState(null)

  const courseId = course?.id

  useEffect(() => {
    if (open && courseId) {
      getMembers(courseId).catch((e) => console.error(e))
    }
  }, [open, courseId, getMembers])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  // Build a unified member list: creator (Instructor) + members (Students)
  const allMembers = []

  if (course?.createdBy) {
    allMembers.push({
      id: course.createdBy.id,
      fullName: course.createdBy.fullName,
      avatarUrl: course.createdBy.avatarUrl,
      email: course.createdBy.email ?? null,
      role: 'Instructor',
      joinedAt: course.createdAt,
    })
  }

  members.forEach((m) => {
    const u = m.user ?? m
    if (u.id !== course?.createdBy?.id) {
      allMembers.push({
        id: u.id,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        email: u.email ?? null,
        role: 'Student',
        joinedAt: m.joinedAt,
      })
    }
  })

  const filtered = allMembers
    .filter((m) => {
      if (activeTab === 'Instructors') return m.role === 'Instructor'
      if (activeTab === 'Students') return m.role === 'Student'
      return true
    })
    .filter((m) => {
      const q = search.toLowerCase()
      return (
        m.fullName?.toLowerCase().includes(q) ||
        (m.email ?? '').toLowerCase().includes(q)
      )
    })

  const instructorCount = allMembers.filter((m) => m.role === 'Instructor').length
  const studentCount = allMembers.filter((m) => m.role === 'Student').length
  const tabCounts = { All: allMembers.length, Instructors: instructorCount, Students: studentCount }

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `Joined ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const handleRemove = async (userId) => {
    try {
      setRemovingId(userId)
      await removeMember(course.id, userId)
    } catch (e) {
      console.error(e)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-app/80" onClick={onClose} />

      {/* modal */}
      <section className="relative z-10 w-full max-w-lg bg-modal rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh]">
        {/* header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 shrink-0">
            <Users size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-fg">Enrolled Members</h2>
            <p className="text-sm text-fg-subtle truncate">
              {course?.name} &bull; {allMembers.length} Total User{allMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-fg-subtle hover:bg-muted hover:text-fg transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* search row */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-input border border-input-border rounded-lg text-sm text-fg placeholder:text-fg-subtle outline-none focus:ring-2 focus:ring-primary-600/50 transition"
            />
          </div>
        </div>

        {/* tabs */}
        <div className="flex items-center gap-2 px-6 pb-3 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-fg text-fg-inverse dark:bg-fg dark:text-fg-inverse'
                  : 'text-fg-muted hover:bg-muted hover:text-fg'
              }`}
            >
              {tab} ({tabCounts[tab]})
            </button>
          ))}
        </div>

        {/* member list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-fg-subtle text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-fg-subtle text-sm">No members found</div>
          ) : (
            <ul>
              {filtered.map((m, i) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 px-6 py-4 ${i < filtered.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/60 transition-colors`}
                >
                  {/* avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                    <MemberAvatar avatarUrl={m.avatarUrl} fullName={m.fullName} />
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-fg truncate">{m.fullName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        m.role === 'Instructor'
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-muted text-fg-muted'
                      }`}>
                        {m.role}
                      </span>
                    </div>
                    {m.email && (
                      <p className="text-xs text-primary-600 truncate mt-0.5">{m.email}</p>
                    )}
                  </div>

                  {/* joined date */}
                  <span className="text-xs text-fg-subtle shrink-0 hidden sm:block">
                    {formatJoinDate(m.joinedAt)}
                  </span>

                  {/* remove button — only for instructor, only for students */}
                  {isTeacher && m.role === 'Student' && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      disabled={removingId === m.id}
                      title="Remove member"
                      className="flex items-center justify-center w-8 h-8 rounded-full text-fg-subtle hover:bg-danger/10 hover:text-danger transition-colors disabled:opacity-50 shrink-0"
                    >
                      {removingId === m.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
                      ) : (
                        <UserMinus size={15} />
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border shrink-0">
          <span className="text-xs text-fg-subtle">
            Showing {filtered.length} of {allMembers.length} member{allMembers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>
    </div>
  )
}
