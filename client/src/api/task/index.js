import api from '../client'

function toFormData(data) {
  const formData = new FormData()
  
  for (const [key, value] of Object.entries(data)) {
    if (value == null || value === '') continue

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
    } else if (value instanceof Blob) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }

  return formData
}

async function createTask(courseId, data) {
  const response = await api.post(`/courses/${courseId}/tasks`, toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

async function submitTask(id, { content, file } = {}) {
  const response = await api.post(`/tasks/${id}/submit`, toFormData({ content, file }), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

async function getTask(id) {
  const response = await api.get(`/tasks/${id}`)
  return response.data
}

async function listTasks(courseId) {
  const response = await api.get(`/courses/${courseId}/tasks`)
  return response.data
}

async function getLatestTask() {
  const response = await api.get('/tasks/latest')
  return response.data
}

async function listMyTasks() {
  const response = await api.get('/tasks')
  return response.data
}

async function updateTask(id, data) {
  const response = await api.patch(`/tasks/${id}`, data)
  return response.data
}

async function deleteTask(id) {
  const response = await api.delete(`/tasks/${id}`)
  return response.data
}

async function getSubmissions(id) {
  const response = await api.get(`/tasks/${id}/submissions`)
  return response.data
}

async function gradeSubmission(taskId, studentId, data) {
  const response = await api.patch(`/tasks/${taskId}/submissions/${studentId}`, data)
  return response.data
}

export {
  createTask,
  submitTask,
  getTask,
  listTasks,
  getLatestTask,
  listMyTasks,
  updateTask,
  deleteTask,
  getSubmissions,
  gradeSubmission,
}
