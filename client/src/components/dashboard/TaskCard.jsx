import { Link } from 'react-router-dom'
import { Clipboard } from 'lucide-react'
import Panel from './Panel'

export default function TaskCard({ task }) {
  return (
    <Panel label="Task Ahead" className="flex flex-col lg:col-span-2">
      <div className="flex flex-1 flex-col justify-start px-6 pb-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center justify-center h-20 w-20 shrink-0 rounded-2xl bg-primary-50 text-primary-600" aria-hidden="true">
              <Clipboard  size={40}/>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-fg sm:text-3xl mb-1">{task.title}</h3>
              <p className="text-lg font-medium leading-5 text-fg-subtle">{task.course}</p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Link
              to="/todo"
              className="flex items-center justify-center rounded-full border border-border bg-btn px-6 py-2.5 text-sm font-medium text-fg-inverse dark:text-fg transition hover:border-border-hover hover:bg-btn-hover"
            >
              View My Tasks
            </Link>
          </div>
        </div>
      </div>
    </Panel>
  );
}