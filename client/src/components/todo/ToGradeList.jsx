import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getTaskType, formatDate } from '../tasks/taskTypes'

export default function ToGradeList({ tasks = [] }) {
  if (tasks.length === 0) return null

  const rows = tasks.map((task) => {
    const { icon: Icon, tile } = getTaskType(task.taskType)

    return (
      <li key={task.taskId}>
        <Link
          to={`/courses/${task.courseId}/task/${task.taskId}/submissions`}
          className="group flex items-center gap-4 px-6 py-4 transition hover:border-border-hover hover:bg-primary-100/67 active:bg-primary-100/67"
        >
          <div
            className={`flex justify-center items-center rounded-xl h-11 w-11 shrink-0 ${tile}`}
          >
            <Icon size={20} strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[14px] font-semibold text-fg leading-tight">
              {task.taskTitle}
            </h3>
            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-widest text-primary-600">
              {task.courseName}
            </p>
          </div>

          <aside className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center rounded-full  font-semibold bg-warning/10 px-2 py-0.5 text-[10px] text-warning">
              {task.toGrade} to Grade
            </span>
            {task.deadline && (
              <span className="font-medium text-xs text-fg-subtle">
                {formatDate(task.deadline)}
              </span>
            )}
            <ChevronRight
              size={16}
              className="text-border transition-colors group-hover:text-fg-subtle"
            />
          </aside>
        </Link>
      </li>
    )
  })

  return (
    <main className="mt-8">
      <div className="overflow-hidden border border-border rounded-2xl bg-card shadow-sm">
        <ul className="divide-y divide-border">
          {rows}
        </ul>
      </div>
    </main>
  )
}