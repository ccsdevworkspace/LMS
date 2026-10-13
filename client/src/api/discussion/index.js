import api from '../client'

export async function getCourseMessages(courseId) {
  const res = await api.get(`/courses/${courseId}/messages`)
  return res.data
}

export async function sendCourseMessage(courseId, content) {
  const res = await api.post(`/courses/${courseId}/messages`, { content })
  return res.data
}

export async function deleteCourseMessage(courseId, messageId) {
  const res = await api.delete(`/courses/${courseId}/messages/${messageId}`)
  return res.data
}
