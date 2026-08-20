import api from '../client'

async function listCourses() {
  const response = await api.get('/courses')
  return response.data
}

async function createCourse(data) {
  const response = await api.post('/courses', data)
  return response.data
}

async function getCourse(id) {
  const response = await api.get(`/courses/${id}`)
  return response.data
}

async function deleteCourse(id) {
  const response = await api.delete(`/courses/${id}`)
  return response.data
}

async function joinCourse(data) {
  const response = await api.post('/courses/join', data)
  return response.data
}

async function leaveCourse(id) {
  const response = await api.post(`/courses/${id}/leave`)
  return response.data
}

async function getMembers(id) {
  const response = await api.get(`/courses/${id}/members`)
  return response.data
}

async function removeMember(courseId, userId) {
  const response = await api.delete(`/courses/${courseId}/members/${userId}`)
  return response.data
}

export {
    listCourses,
    createCourse,
    getCourse,
    deleteCourse,
    joinCourse,
    leaveCourse,
    getMembers,
    removeMember
}