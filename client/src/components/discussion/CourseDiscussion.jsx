import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Users, ArrowUp, Trash2 } from 'lucide-react'
import { useCourseStore } from '../../stores/course'
import { useUserStore } from '../../stores/user'
import { useDiscussionStore } from '../../stores/discussion'
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

function formatDateLabel(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false
  const date1 = new Date(d1)
  const date2 = new Date(d2)
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export default function CourseDiscussion() {
  const { id } = useParams()
  const { getCourse, currentCourse, loading: courseLoading } = useCourseStore()
  const profile = useUserStore((s) => s.profile)
  const {
    messages,
    loading: messagesLoading,
    loadInitialMessages,
    fetchMessages,
    sendMessage,
    deleteMessage,
  } = useDiscussionStore()

  const [inputContent, setInputContent] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load course details & messages
  useEffect(() => {
    if (id) {
      getCourse(id).catch(console.error)
      loadInitialMessages(id).catch(console.error)
    }
  }, [id, getCourse, loadInitialMessages])

  // Polling for updates every 3 seconds
  useEffect(() => {
    if (!id) return
    const interval = setInterval(() => {
      fetchMessages(id).catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [id, fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    const content = inputContent.trim()
    if (!content || sending) return

    setInputContent('')
    setSending(true)
    try {
      await sendMessage(id, content, profile)
    } catch (err) {
      console.error(err)
      setInputContent(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDelete = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteMessage(id, messageId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (courseLoading && !currentCourse) {
    return <Loading />
  }

  const isTeacher = currentCourse?.createdById === profile?.id
  const hasText = inputContent.trim().length > 0

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 sm:px-8 py-6">
      {/* Top Navigation */}
      <nav className="mb-4">
        <Link
          to={`/courses/${id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-600/80 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          COURSE
        </Link>
      </nav>

      {/* Header */}
      <header className="flex items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-fg tracking-tight">
            {currentCourse?.name || 'Subject'}
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-fg-muted mt-1">
            {currentCourse?.section || 'SECTION'}
          </p>
        </div>

        {/* Members Pill Button */}
        <Link
          to={`/courses/${id}/discussion/members`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border text-sm font-medium text-fg-muted hover:border-border-hover hover:text-fg hover:bg-muted/60 transition-all active:scale-95 shrink-0"
        >
          <Users size={16} />
          <span>Members</span>
          <ChevronRight size={16} />
        </Link>
      </header>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-fg-subtle">
            Loading discussions...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-fg mb-1">Welcome to Discussions</h3>
            <p className="text-sm text-fg-muted max-w-md">
              Share something with the class, ask questions, and collaborate with your peers.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : null
            const showDateDivider = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt)
            const isAuthor = msg.senderId === profile?.id
            const canDelete = isAuthor || isTeacher

            return (
              <div key={msg.id} className="space-y-4">
                {/* Date separator divider */}
                {showDateDivider && (
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative bg-app px-4 text-xs font-semibold text-fg-subtle">
                      {formatDateLabel(msg.createdAt)}
                    </div>
                  </div>
                )}

                {/* Message Item */}
                <div
                  className={`group flex items-start gap-3.5 ${
                    msg.isOptimistic ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                    <MemberAvatar
                      avatarUrl={msg.sender?.avatarUrl}
                      fullName={msg.sender?.fullName}
                    />
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-fg">
                        {msg.sender?.fullName || 'User'}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          title="Delete message"
                          className="opacity-0 group-hover:opacity-100 text-fg-subtle hover:text-danger transition-opacity p-0.5 ml-2 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-fg-muted mt-0.5 whitespace-pre-wrap leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="pt-2 pb-2">
        <div className="relative flex items-center w-full rounded-2xl border border-border bg-card shadow-sm px-4 py-2.5 focus-within:border-primary-600/60 focus-within:ring-2 focus-within:ring-primary-600/15 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share something with the class..."
            className="w-full bg-transparent border-none outline-none text-sm text-fg placeholder:text-fg-subtle pr-3"
          />

          <button
            type="submit"
            disabled={!hasText || sending}
            title="Send message"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              hasText
                ? 'bg-primary-600 hover:bg-btn-hover text-white shadow-sm active:scale-95 cursor-pointer'
                : 'bg-primary-100/50 text-primary-400 dark:bg-primary-950/40 dark:text-primary-600/50 cursor-not-allowed'
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  )
}
