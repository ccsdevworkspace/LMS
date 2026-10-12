import { useEffect, useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { useTodoStore } from '../../stores/todo'

export default function MyList() {
  const todos = useTodoStore((s) => s.todos)
  const fetchTodos = useTodoStore((s) => s.fetchTodos)
  const addTodo = useTodoStore((s) => s.addTodo)
  const removeTodo = useTodoStore((s) => s.removeTodo)
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const submit = (e) => {
    e.preventDefault()
    const value = title.trim()
    if (!value) return
    addTodo(value)
    setTitle('')
  }

  const listItems = todos.map((todo) => (
    <li
      key={todo.id}
      className="group flex items-center gap-3 px-4 py-3"
    >
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          className="peer sr-only"
        />

        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border text-transparent peer-checked:border-primary-600 peer-checked:bg-primary-600 peer-checked:text-white">
          <Check size={14} />
        </span>

        <span className="min-w-0 flex-1 truncate text-sm text-fg peer-checked:text-fg-subtle peer-checked:line-through">
          {todo.title}
        </span>
      </label>

      <button
        type="button"
        onClick={() => removeTodo(todo.id)}
        className="shrink-0 rounded-lg p-1.5 text-fg-subtle opacity-0 transition hover:text-danger group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </li>
  ))

  return (
    <main className="flex h-full min-h-95 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-b border-border p-3"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-primary-400"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex justify-center items-center rounded-xl bg-primary-600 h-9 w-9 shrink-0 text-white transition hover:bg-primary-500 disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </form>

      {todos.length === 0 ? (
        <div className="flex flex-1 justify-center items-center">
          <figure className="flex flex-col justify-center items-center text-center gap-4 py-16">
            <img
            src="/list.webp"
            className="h-36 w-auto"
            />
            <section>
              <p className="text-sm font-semibold text-fg">All done</p>
              <p className="mt-0.5 text-xs text-fg-subtle">No personal tasks yet</p>
            </section>
          </figure>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-border overflow-y-auto">
          {listItems}
        </ul>
      )}
    </main>
  )
}
