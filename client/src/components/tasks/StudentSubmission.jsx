import { useState } from 'react'
import { Upload, X, CheckCircle2, Paperclip } from 'lucide-react'
import { useTaskStore } from '../../stores/task'
import { getFileName, formatDateTime } from './taskTypes'

export default function StudentSubmission({ taskId, submission, totalPoints }) {
  const { submitTask, loading } = useTaskStore()
  const [answerText, setAnswerText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0])
  }

  const handleSubmitWork = async (e) => {
    e.preventDefault()
    if (!selectedFile && !answerText.trim()) return
    setSubmitError(null)

    try {
      await submitTask(taskId, {
        content: answerText.trim() || undefined,
        file: selectedFile || undefined,
      })
      setSelectedFile(null)
      setAnswerText('')
    } catch (err) {
      setSubmitError(err?.response?.data?.error || err?.message || 'Failed to submit')
    }
  }

  if (submission) {
    const attachmentLinks = submission.attachments.map((fileUrl, idx) => (
      <a
        key={idx}
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:underline"
      >
        <Paperclip size={14} />
        {getFileName(fileUrl)}
      </a>
    ))

    return (
      <section className="flex flex-col gap-3 pt-4 border-t border-border">
        <h3 className="text-base font-bold text-fg">Your Submission</h3>

        <div className="flex flex-col gap-3 p-5 bg-card border border-border rounded-2xl">
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-primary-600" />
              <span className="text-sm font-bold text-fg">Turned In</span>
            </div>
            {submission.submittedAt && (
              <span className="text-xs text-fg-muted">
                Submitted on {formatDateTime(submission.submittedAt)}
              </span>
            )}
          </div>
          
          {submission.status === 'GRADED' && (
            <div className="mt-2 p-3 rounded-xl bg-primary-600/10 border border-primary-600/20 flex flex-col gap-1">
              <span className="text-xs font-bold text-primary-600">
                Grade: {submission.score} / {totalPoints ?? '\u2014'}
              </span>
              {submission.feedback && (
                <p className="text-xs text-fg-muted whitespace-pre-line wrap-break-word">Feedback: {submission.feedback}</p>
              )}
            </div>
          )}

          {submission.content && (
            <div className="mt-1 p-3.5 rounded-xl bg-surface border border-border">
              <span className="text-xs font-semibold text-fg-muted block mb-1">Your Answer:</span>
              <p className="text-sm text-fg leading-relaxed whitespace-pre-line wrap-break-word">
                {submission.content}
              </p>
            </div>
          )}

          {submission.attachments?.length > 0 && (
            <div className="flex flex-col gap-2 mt-1 pt-3">
              <span className="text-xs font-semibold text-fg-muted">Submitted Attachment:</span>
              {attachmentLinks}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3 pt-4 border-t border-border">
      <h3 className="text-base font-bold text-fg">Your Submission</h3>

      <form onSubmit={handleSubmitWork} className="flex flex-col gap-4">
        <textarea
          rows={4}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="type your answer here..."
          className="w-full rounded-2xl border border-border bg-card p-4 text-sm text-fg placeholder:text-fg-disabled outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/50"
        />

        <label className="flex cursor-pointer justify-between items-center p-4 sm:p-5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex justify-center items-center w-11 h-11 shrink-0 rounded-xl bg-primary-600/10 text-primary-600 dark:text-primary-400">
              <Upload size={20} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-bold text-fg">
                {selectedFile ? selectedFile.name : 'Upload File'}
              </h4>
              <p className="text-xs text-fg-muted truncate">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Attach your work file or document'}
              </p>
            </div>
          </div>

          <input 
          type="file" 
          onChange={handleFileSelect} 
          className="sr-only"
          />
          {selectedFile ? (
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1.5 rounded-full hover:bg-muted text-fg-subtle hover:text-danger transition"
            >
              <X size={16} />
            </button>
          ) : (
            <span
              className="shrink-0 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-border text-fg hover:bg-muted transition"
            >
              Upload File
            </span>
          )}
        </label>

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-btn text-sm rounded-xl w-full sm:w-auto px-8 py-2.5 font-bold text-fg-inverse dark:text-fg hover:bg-btn-hover active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </section>
  )
}
