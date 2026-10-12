import { useEffect, useState } from 'react'
import { useTaskStore } from '../stores/task'
import TaskPanel from '../components/todo/TaskPanel'
import ToGradeList from '../components/todo/ToGradeList'
import MyList from '../components/todo/MyList'

export default function Todo() {
  const myTasks = useTaskStore((s) => s.myTasks) ?? []
  const tasksToGrade = useTaskStore((s) => s.tasksToGrade) ?? []
  const fetchMyTasks = useTaskStore((s) => s.fetchMyTasks)
  const isLoadingMyTasks = useTaskStore((s) => s.isLoadingMyTasks)
  const [filter, setFilter] = useState('To Do')

  useEffect(() => {
    fetchMyTasks()
  }, [fetchMyTasks])

  const filtered = myTasks.filter((task) => {
    const status = task.mySubmission?.status
    if (filter === 'To Do') return !status
    if (filter === 'Submitted') return status === 'SUBMITTED'
    if (filter === 'Completed') return status === 'GRADED'
    return false
  })

  const counts = {
    'To Do': myTasks.filter((t) => !t.mySubmission?.status).length,
    Submitted: myTasks.filter((t) => t.mySubmission?.status === 'SUBMITTED').length,
    Completed: myTasks.filter((t) => t.mySubmission?.status === 'GRADED').length,
  }

  return (
    <main className="flex flex-col mt-12">
      <section className="flex-1 p-6 sm:p-12 lg:p-18">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col">
            <MyList />
          </div>
          <div className="flex flex-col">
            <TaskPanel
              tasks={filtered}
              loading={isLoadingMyTasks}
              filter={filter}
              counts={counts}
              onChange={setFilter}
            />
          </div>
        </section>

        <ToGradeList tasks={tasksToGrade} />
      </section>
    </main>
  )
}