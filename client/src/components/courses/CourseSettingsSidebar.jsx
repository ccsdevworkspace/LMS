import { useState } from 'react'
import { useCourseStore } from '../../stores/course'
import { X, Link2, Users, LogOut, Trash2, Pencil, Check, ChevronDown } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const labelClass = 'text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-2 block'

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-fg-subtle">{label}</span>
      <span className="text-sm font-semibold text-fg text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className={labelClass}>{children}</p>
}

export default function CourseSettingsSidebar({
  open,
  onClose,
  course,
  isTeacher,
  onOpenMembers,
  onLeave,
  onDelete,
  onCopyLink,
}) {
  const { updateCourse, loading } = useCourseStore()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [editError, setEditError] = useState('')

  const handleEditOpen = () => {
    setEditData({
      name: course.name,
      section: course.section ?? '',
      days: [...(course.days ?? [])],
      startTime: course.startTime ?? '',
      endTime: course.endTime ?? '',
    })
    setEditError('')
    setEditing(true)
  }

  const handleEditCancel = () => {
    setEditing(false)
    setEditError('')
  }

  const toggleDay = (day) => {
    setEditData((prev) => {
      const already = prev.days.includes(day)
      const next = already
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day]
      return { ...prev, days: DAYS.filter((d) => next.includes(d)) }
    })
  }

  const handleEditSave = async () => {
    setEditError('')
    if (!editData.name?.trim()) { setEditError('Course name is required'); return }
    if (!editData.days?.length) { setEditError('Select at least one day'); return }
    if (!editData.startTime || !editData.endTime) { setEditError('Start and end times are required'); return }
    if (editData.startTime >= editData.endTime) { setEditError('End time must be after start time'); return }
    try {
      await updateCourse(course.id, editData)
      setEditing(false)
    } catch (e) {
      setEditError(e?.response?.data?.error || 'Failed to update course')
    }
  }

  const formatSchedule = () => {
    if (!course) return ''
    const days = (course.days ?? []).join(' & ')
    const start = course.startTime ?? ''
    const end = course.endTime ?? ''
    return `${days} · ${start} to ${end}`
  }

  if (!open) return null

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-app/60"
        onClick={onClose}
      />

      {/* sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-96 bg-modal border-l border-border shadow-xl flex flex-col
          transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-fg">Course Management</h2>
            <p className="text-sm text-fg-subtle mt-0.5">Settings, invite links and course controls</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-fg-subtle hover:bg-muted hover:text-fg transition-colors shrink-0 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* INVITE LINK & CODE */}
          <div>
            <SectionLabel>Invite Link &amp; Code</SectionLabel>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-xs font-mono text-fg-subtle bg-muted rounded-lg px-3 py-2 truncate">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/join/${course?.joinCode}`
                    : `/join/${course?.joinCode}`}
                </span>
                <button
                  onClick={onCopyLink}
                  title="Copy link"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-fg-inverse dark:text-fg text-xs font-bold hover:bg-btn-hover active:scale-95 transition-all shrink-0"
                >
                  <Link2 size={13} />
                  Copy
                </button>
              </div>
              {course?.joinCode && (
                <p className="text-xs text-fg-subtle">
                  Course Code: <span className="font-bold text-fg">{course.joinCode}</span>
                </p>
              )}
            </div>
          </div>

          {/* COURSE COMMUNITY */}
          <div>
            <SectionLabel>Course Community</SectionLabel>
            <button
              onClick={onOpenMembers}
              className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-border-hover hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 shrink-0">
                <Users size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-fg">Members &amp; Roster</p>
                <p className="text-xs text-fg-subtle mt-0.5">View enrolled students and instructor info</p>
              </div>
              <ChevronDown size={16} className="-rotate-90 text-border group-hover:text-fg-muted transition-colors shrink-0" />
            </button>
          </div>

          {/* COURSE INFORMATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Course Information</SectionLabel>
              {isTeacher && !editing && (
                <button
                  onClick={handleEditOpen}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:opacity-70 transition-opacity mb-2"
                >
                  <Pencil size={12} />
                  Edit Details
                </button>
              )}
            </div>

            {editing ? (
              /* ---- EDIT FORM ---- */
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                {/* name */}
                <div>
                  <label className="text-xs font-semibold text-fg-muted mb-1.5 block">Course Name</label>
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input-border bg-input text-sm text-fg outline-none focus:ring-2 focus:ring-primary-600/50 transition"
                    placeholder="Course name"
                  />
                </div>

                {/* section */}
                <div>
                  <label className="text-xs font-semibold text-fg-muted mb-1.5 block">Section</label>
                  <input
                    value={editData.section}
                    onChange={(e) => setEditData((p) => ({ ...p, section: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input-border bg-input text-sm text-fg outline-none focus:ring-2 focus:ring-primary-600/50 transition"
                    placeholder="e.g. BSCS 4A"
                  />
                </div>

                {/* days */}
                <div>
                  <label className="text-xs font-semibold text-fg-muted mb-1.5 block">Schedule Days</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DAYS.map((day) => {
                      const selected = editData.days?.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                            selected
                              ? 'border-primary-600 bg-primary-100 text-primary-600'
                              : 'border-border text-fg-subtle hover:bg-muted hover:text-fg'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-fg-muted mb-1.5 block">Start</label>
                    <div onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}>
                      <input
                        type="time"
                        value={editData.startTime}
                        onChange={(e) => setEditData((p) => ({ ...p, startTime: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-input-border bg-input text-sm text-fg outline-none focus:ring-2 focus:ring-primary-600/50 transition cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-fg-muted mb-1.5 block">End</label>
                    <div onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}>
                      <input
                        type="time"
                        value={editData.endTime}
                        onChange={(e) => setEditData((p) => ({ ...p, endTime: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-input-border bg-input text-sm text-fg outline-none focus:ring-2 focus:ring-primary-600/50 transition cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {editError && <p className="text-xs text-danger">{editError}</p>}

                {/* actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleEditCancel}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg border border-border text-sm font-semibold text-fg hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary-600 text-fg-inverse dark:text-fg text-sm font-bold hover:bg-btn-hover active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : (
                      <><Check size={15} /> Save</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ---- INFO DISPLAY ---- */
              <div className="bg-card border border-border rounded-xl px-4">
                <InfoRow label="Instructor" value={course?.createdBy?.fullName ?? '—'} />
                <InfoRow label="Section" value={course?.section ?? '—'} />
                <InfoRow label="Schedule" value={formatSchedule()} />
              </div>
            )}
          </div>
        </div>

        {/* footer: leave / delete */}
        <div className="px-6 py-5 border-t border-border shrink-0">
          {isTeacher ? (
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm font-bold hover:bg-danger/10 active:scale-[.98] transition-all"
            >
              <Trash2 size={15} />
              Delete / Archive Course
            </button>
          ) : (
            <button
              onClick={onLeave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm font-bold hover:bg-danger/10 active:scale-[.98] transition-all"
            >
              <LogOut size={15} />
              Leave Course
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
