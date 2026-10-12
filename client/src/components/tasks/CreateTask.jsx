import { useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, Upload, X, Paperclip } from 'lucide-react'
import { useTaskStore } from '../../stores/task'
import Field from '../app/Field'
import { TASK_TYPES, toDeadline } from './taskTypes'

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  totalPoints: z
    .string()
    .refine((value) => value === '' || Number(value) >= 0, 'Points cannot be negative')
    .optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  instructions: z.string().trim().optional(),
})

function openPicker(e) {
  e.currentTarget.querySelector('input')?.showPicker?.()
}

function ResourceUpload({ files, onSelect, onRemove }) {
  function handleChange(e) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    onSelect(selected)
    e.target.value = ''
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-fg mb-2">Resources</label>
      <div className="flex flex-col gap-3">
        <label
          htmlFor="task-files"
          className="flex cursor-pointer items-center justify-between p-4 sm:p-5 bg-card border border-border rounded-xl"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-primary-600/10 text-primary-600 dark:text-primary-400">
              <Upload size={22} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-bold text-fg">Upload files</h4>
              <p className="text-xs text-fg-muted truncate">Attach files, guides, or reference materials</p>
            </div>
          </div>

          <input 
          id="task-files" 
          type="file" 
          multiple 
          onChange={handleChange} 
          className="sr-only"
          />
          <span
            className="shrink-0 ml-4 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-border text-fg hover:bg-muted transition"
          >
            Choose Files
          </span>
        </label>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center rounded-lg bg-surface gap-2 px-3 py-1.5 border border-border text-xs text-fg"
              >
                <Paperclip size={14} className="text-fg-muted shrink-0" />
                <span className="truncate max-w-50">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-fg-subtle hover:text-danger ml-1 p-0.5 rounded-full hover:bg-muted cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreateTask() {
  const { id: courseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { createTask, loading } = useTaskStore()
  const [error, setError] = useState(null)
  const [files, setFiles] = useState([])

  const tasksPath = `/courses/${courseId}/task`

  const typeParam = searchParams.get('type')?.toUpperCase()
  const type = typeParam === 'ACTIVITY' ? 'ACTIVITY' : 'ASSIGNMENT'
  const { label, icon: Icon, badge } = TASK_TYPES[type]

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
    defaultValues: { title: '', totalPoints: '', date: '', time: '', instructions: '' },
  })

  function addFiles(newFiles) {
    setFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function saveTask(data, publish) {
    setError(null)

    if (publish && !data.date) {
      setError('Date is required to publish a task')
      return
    }

    try {
      await createTask(courseId, {
        type,
        title: data.title,
        totalPoints: data.totalPoints ? Number(data.totalPoints) : undefined,
        instructions: data.instructions || undefined,
        deadline: toDeadline(data.date, data.time),
        publish,
        files,
      })
      navigate(tasksPath)
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to create task')
    }
  }

  const publishTask = handleSubmit((data) => saveTask(data, true))
  const saveDraft = handleSubmit((data) => saveTask(data, false))

  const labelClass = 'block text-sm font-semibold text-fg mb-2'

  return (
    <main className="max-w-3xl mx-auto w-full p-6 lg:p-12 flex flex-col gap-8">
      <nav>
        <Link
          to={tasksPath}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ChevronLeft size={18} />
          TASKS
        </Link>
      </nav>

      <header className="-mt-3 flex items-center gap-4">
        <div className={`flex justify-center items-center w-12 h-12 rounded-xl shrink-0 ${badge}`}>
          <Icon size={24} strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
          CREATE {label.toUpperCase()}
        </h1>
      </header>

      <form className="flex flex-col gap-6" onSubmit={publishTask}>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-4">
          <div>
            <label className={labelClass}>Title</label>
            <Field
              placeholder="Enter task title"
              registration={register('title')}
              state={errors.title ? 'error' : 'default'}
              message={errors.title?.message}
            />
          </div>
          <div>
            <label className={labelClass}>Points</label>
            <Field
              type="number"
              min="0"
              placeholder="100"
              registration={register('totalPoints')}
              state={errors.totalPoints ? 'error' : 'default'}
              message={errors.totalPoints?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <div onClick={openPicker} className="w-full cursor-pointer">
              <Field type="date" registration={register('date')} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <div onClick={openPicker} className="w-full cursor-pointer">
              <Field type="time" registration={register('time')} />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Instructions</label>
          <textarea
            rows={5}
            placeholder="Write task instructions..."
            {...register('instructions')}
            className="w-full rounded-xl border border-border bg-input p-4 text-sm text-fg placeholder:text-fg-disabled outline-none transition duration-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/50"
          />
        </div>

        <ResourceUpload 
        files={files} 
        onSelect={addFiles} 
        onRemove={removeFile}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-6 mt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate(tasksPath)}
            className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold text-fg hover:bg-muted transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!isValid || loading}
              onClick={saveDraft}
              className="px-6 py-2.5 rounded-xl border border-primary-600/40 text-sm font-bold text-primary-600 hover:bg-primary-600/10 transition disabled:opacity-50 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="px-8 py-2.5 rounded-xl bg-btn text-sm font-bold text-fg-inverse dark:text-fg hover:bg-btn-hover active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
