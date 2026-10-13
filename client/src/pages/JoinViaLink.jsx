import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'
import { getCoursePreview } from '../api/course'
import Loading from '../components/app/Loading'
import { GraduationCap, LogIn, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const PENDING_JOIN_KEY = 'lms_pending_join_code'

export default function JoinViaLink() {
  const { code } = useParams()
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const authCheckLoading = useAuthStore((s) => s.loading)
  const login = useAuthStore((s) => s.login)
  const joinCourseStore = useCourseStore((s) => s.joinCourse)
  const storeLoading = useCourseStore((s) => s.loading)
  const courses = useCourseStore((s) => s.courses)

  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [previewError, setPreviewError] = useState(null)

  const [joinState, setJoinState] = useState('idle') // 'idle' | 'joining' | 'success' | 'error' | 'already_member'
  const [joinError, setJoinError] = useState(null)
  const [joinedCourse, setJoinedCourse] = useState(null)

  // Fetch the course preview (public endpoint)
  useEffect(() => {
    async function load() {
      setPreviewLoading(true)
      setPreviewError(null)
      try {
        const data = await getCoursePreview(code)
        setPreview(data.course)
      } catch (err) {
        setPreviewError(
          err?.response?.status === 404
            ? 'This invitation link is invalid or the course no longer exists.'
            : 'Failed to load course details. Please try again.'
        )
      } finally {
        setPreviewLoading(false)
      }
    }
    load()
  }, [code])

  // Handle join action on user confirmation
  async function handleJoin() {
    sessionStorage.removeItem(PENDING_JOIN_KEY)
    setJoinState('joining')
    setJoinError(null)
    try {
      const course = await joinCourseStore({ code })
      setJoinedCourse(course)
      setJoinState('success')
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Could not join the course.'
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('own')) {
        // Already enrolled — try to redirect directly
        const existing = courses.find((c) => c.joinCode === code || c.id === preview?.id)
        if (existing) {
          navigate(`/courses/${existing.id}`, { replace: true })
          return
        }
        setJoinState('already_member')
      } else {
        setJoinState('error')
        setJoinError(msg)
      }
    }
  }

  function handleLoginToJoin() {
    sessionStorage.setItem(PENDING_JOIN_KEY, code)
    login()
  }

  // Redirect after successful join
  useEffect(() => {
    if (joinState === 'success' && joinedCourse) {
      const timer = setTimeout(() => {
        navigate(`/courses/${joinedCourse.id}`, { replace: true })
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [joinState, joinedCourse, navigate])

  if (previewLoading || authCheckLoading) {
    return <Loading />
  }

  if (previewError) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-sm gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-danger/10 text-danger">
            <AlertCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-fg mb-2">Link Invalid</h1>
            <p className="text-sm text-fg-subtle leading-relaxed">{previewError}</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-fg-inverse dark:text-fg text-sm font-bold hover:bg-btn-hover active:scale-95 transition-all"
          >
            Go Home <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    )
  }

  if (joinState === 'success' && joinedCourse) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-sm gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/10 text-primary-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-fg mb-1">
              Class <span className="text-primary-600">Joined!</span>
            </h1>
            <p className="text-sm text-fg-subtle">
              You've successfully joined{' '}
              <span className="font-semibold text-fg">{joinedCourse.name}</span>.
            </p>
          </div>
          <p className="text-xs text-fg-subtle flex items-center gap-1.5">
            <Clock size={12} /> Redirecting to your course…
          </p>
        </div>
      </main>
    )
  }

  if (joinState === 'already_member') {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-sm gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/10 text-primary-600">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-fg mb-2">Already Enrolled</h1>
            <p className="text-sm text-fg-subtle">You're already a member of this course.</p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-fg-inverse dark:text-fg text-sm font-bold hover:bg-btn-hover active:scale-95 transition-all"
          >
            My Courses <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-fg-inverse dark:text-fg">
              <GraduationCap size={20} />
            </div>
            <span className="text-lg font-extrabold text-fg tracking-tight">Bapp LMS</span>
          </div>
        </div>

        {/* Card */}
        {!user ? (
          <div className="bg-modal border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center text-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600/10 text-primary-600">
              <LogIn size={26} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-fg mb-2">Sign in to Join</h2>
              <p className="text-sm text-fg-subtle leading-relaxed">
                Please sign in first to be able to join{' '}
                {preview?.name ? (
                  <span className="font-semibold text-fg">{preview.name}</span>
                ) : (
                  'this course'
                )}
                .
              </p>
            </div>
            <div className="w-full flex flex-col gap-3 pt-1">
              <button
                id="join-via-link-signin-btn"
                onClick={handleLoginToJoin}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 text-fg-inverse dark:text-fg text-sm font-bold hover:bg-btn-hover active:scale-95 transition-all"
              >
                <LogIn size={16} />
                Sign in
              </button>
              <Link
                to="/"
                className="w-full flex items-center justify-center py-3 rounded-xl border border-border text-sm font-semibold text-fg hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-modal border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Header stripe */}
            <div className="bg-primary-600 px-7 py-6">
              <p className="text-xs font-bold uppercase tracking-widest text-fg-inverse/70 dark:text-fg/70 mb-1">
                Course Invitation
              </p>
              <h1 className="text-2xl font-extrabold text-fg-inverse dark:text-fg leading-tight">
                {preview?.name}
              </h1>
              {preview?.section && (
                <p className="text-sm font-semibold text-fg-inverse/80 dark:text-fg/80 mt-1">
                  {preview.section}
                </p>
              )}
            </div>

            <div className="px-7 py-6 flex flex-col gap-6">
              {/* Instructor */}
              {preview?.createdBy?.fullName && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                  {preview.createdBy.avatarUrl ? (
                    <img
                      src={preview.createdBy.avatarUrl}
                      alt={preview.createdBy.fullName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-600 shrink-0 font-bold text-sm">
                      {preview.createdBy.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-fg-subtle uppercase tracking-wide">Instructor</p>
                    <p className="text-sm font-bold text-fg">{preview.createdBy.fullName}</p>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {joinState === 'error' && joinError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              {/* CTA */}
              {joinState === 'joining' || storeLoading ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-fg-subtle">Joining course…</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-fg-subtle text-center leading-relaxed">
                    Would you like to join this course?
                  </p>
                  <button
                    id="join-via-link-join-btn"
                    onClick={handleJoin}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 text-fg-inverse dark:text-fg text-sm font-bold hover:bg-btn-hover active:scale-95 transition-all"
                  >
                    <ArrowRight size={16} />
                    Join Course
                  </button>
                  <Link
                    to="/courses"
                    className="w-full flex items-center justify-center py-3 rounded-xl border border-border text-sm font-semibold text-fg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course code hint */}
        {user && preview?.joinCode && (
          <p className="text-center text-xs text-fg-subtle mt-4">
            Course code: <span className="font-bold text-fg font-mono">{preview.joinCode}</span>
          </p>
        )}
      </div>
    </main>
  )
}
