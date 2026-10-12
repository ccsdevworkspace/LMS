import { create } from 'zustand'
import {
  listTodos,
  createTodo,
  deleteTodo,
} from '../../api/todo'

export const useTodoStore = create((set) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true })
    try {
      const { todos } = await listTodos()
      set({ todos })
    } finally {
      set({ loading: false })
    }
  },

  addTodo: async (title) => {
    const { todo } = await createTodo(title)
    set((state) => ({
      todos: [todo, ...state.todos],
    }))
  },

  removeTodo: async (id) => {
    await deleteTodo(id)
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }))
  },
}))
