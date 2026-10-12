import api from '../client'

async function createTodo(title) {
  const response = await api.post('/todos', { title })
  return response.data
}

async function deleteTodo(id) {
  const response = await api.delete(`/todos/${id}`)
  return response.data
}

async function listTodos() {
  const response = await api.get('/todos')
  return response.data
}

export {
  createTodo,
  deleteTodo,
  listTodos
}
