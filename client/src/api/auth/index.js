import api from '../client'

export async function me() {
  const response = await api.get('/auth/me')
  return response.data.user
}

export async function logout() {
  const response = await api.post('/auth/logout')
  return response.data
}