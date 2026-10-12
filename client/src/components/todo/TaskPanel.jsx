import { Link } from 'react-router-dom'
import { ChevronRight, AlertCircle, Clock } from 'lucide-react'
import Loading from '../app/Loading'
import { getTaskType, formatDate, getDaysLeft } from '../tasks/taskTypes'

const FILTERS = ['To Do', 'Submitted', 'Completed']

const EMPTY_MESSAGES = {
  'To Do': { title: 'All done', sub: 'No tasks for you now' },
  Submitted: { title: 'Nothing submitted', sub: 'Submitted tasks appear here' },
  Completed: { title: 'No graded tasks', sub: 'Graded tasks appear here' },
}

function FilterTabs({ filters, active, counts, onChange }) {
  const tabs = filters.map((key) => {
    const isActive = active === key
    const count = counts[key] ?? 0

    return (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`flex items-center gap-1.5 rounded-full font-medium text-sm px-4 py-2 transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-600'
            : 'text-fg-subtle hover:text-fg hover:bg-soft'
        }`}
      >
        {key}
        {count > 0 && (
          <span
            className={`text-[11px] font-bold tabular-nums ${
              isActive ? 'text-primary-600' : 'text-fg-disabled'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    )
  })

  return (
    <div className="flex items-center gap-1">
      {tabs}
    </div>
  )
}

function UrgencyBadge({ days }) {
  if (days === null) return null

  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
        <AlertCircle size={10}/>
        Overdue
      </span>
    )
  if (days === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
        <Clock size={10}/>
        Due today
      </span>
    )
  if (days <= 2)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
        <Clock size={10}/>
        {days}d left
      </span>
    )
  return null
}

function TaskRow({ task }) {
  const { icon: Icon, tile } = getTaskType(task.type)
  const date = formatDate(task.deadline)
  const days = getDaysLeft(task.deadline)
  const isOverdue = days !== null && days < 0

  return (
    <li>
      <Link
        to={`/courses/${task.courseId}/task/${task.id}`}
        className="group flex items-center gap-4 px-6 py-4 transition hover:border-border-hover hover:bg-primary-100/67 active:bg-primary-100/67"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tile}`}
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold text-fg leading-tight">
            {task.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-primary-600">
              {task.course?.name}
            </p>
            <UrgencyBadge days={days} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {date && (
            <span
              className={`text-xs font-medium tabular-nums ${
                isOverdue ? 'text-danger' : 'text-fg-subtle'
              }`}
            >
              {date}
            </span>
          )}
          <ChevronRight
            size={16}
            className="text-border transition-colors group-hover:text-fg-subtle"
          />
        </div>
      </Link>
    </li>
  )
}

function EmptyState({ filter }) {
  const { title, sub } = EMPTY_MESSAGES[filter] ?? EMPTY_MESSAGES['To Do']

  return (
    <figure className="flex flex-col justify-center items-center text-center gap-4 py-16">
      <img src="/todo.webp" className="h-40 w-auto"/>
      <section>
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="mt-0.5 text-xs text-fg-subtle">{sub}</p>
      </section>
    </figure>
  )
}

export default function TaskPanel({ tasks = [], loading, filter, counts = {}, onChange }) {
  const rows = tasks.map((task) => (
    <TaskRow 
    key={task.id} 
    task={task} />
  ))

  return (
    <main className="flex h-full min-h-95 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex justify-end items-center gap-2 border-b border-border p-3">
        <FilterTabs 
        filters={FILTERS} 
        active={filter} 
        counts={counts} 
        onChange={onChange}
        />
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex flex-1 justify-center items-center py-16">
          <Loading />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-1 justify-center items-center">
          <EmptyState filter={filter} />
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-border overflow-y-auto">
          {rows}
        </ul>
      )}
    </main>
  )
}
