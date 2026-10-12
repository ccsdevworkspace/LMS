import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTaskStore } from '../../stores/task'

export default function SubmissionGradeForm({ task, studentId, submission }) {
  const { gradeSubmission, loading } = useTaskStore()
  const [scoreInput, setScoreInput] = useState(submission?.score ?? '')
  const [feedbackInput, setFeedbackInput] = useState(submission?.feedback ?? '')
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      await gradeSubmission(task.id, studentId, {
        score: scoreInput !== '' ? Number(scoreInput) : undefined,
        feedback: feedbackInput.trim() || undefined,
      })
      setSuccessMsg('Grade submitted!')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Failed to submit grade')
    }
  }

  const maxScore = task?.totalPoints ?? 100

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-fg">Grade</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-fg">
          Score {task?.totalPoints != null && `(out of ${task.totalPoints})`}
        </label>
        <input
          type="number"
          min="0"
          max={maxScore}
          value={scoreInput}
          onChange={(e) => setScoreInput(e.target.value)}
          placeholder="Enter score"
          className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs text-fg placeholder:text-fg-disabled outline-none transition focus:border-primary-600 focus:ring-1 focus:ring-primary-600/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-fg">Feedback</label>
        <textarea
          rows={4}
          value={feedbackInput}
          onChange={(e) => setFeedbackInput(e.target.value)}
          placeholder="Write feedback, remarks, or notes for the student..."
          className="w-full resize-none rounded-xl border border-border bg-input p-3.5 text-sm text-fg placeholder:text-fg-disabled outline-none transition focus:border-primary-600 focus:ring-1 focus:ring-primary-600/50"
        />
      </div>

      <p className={`text-xs font-bold text-success flex items-center gap-1.5 min-h-4.5 ${successMsg ? '' : 'invisible'}`}>
        {successMsg && <CheckCircle2 size={14} />}
        <span>{successMsg || ' '}</span>
      </p>

      <p className={`text-xs font-bold text-danger flex items-center gap-1.5 min-h-4.5 ${errorMsg ? '' : 'invisible'}`}>
        {errorMsg && <AlertCircle size={14} />}
        <span>{errorMsg || ' '}</span>
      </p>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl bg-btn hover:bg-btn-hover text-fg-inverse dark:text-fg text-xs font-bold active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
