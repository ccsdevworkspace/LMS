import api from './client';

export async function getLiveClassStatus(courseId) {
  const { data } = await api.get(`/courses/${courseId}/live-class`);
  return data;
}

export async function createLiveClass(courseId) {
  const { data } = await api.post(`/courses/${courseId}/live-class`);
  return data;
}

export async function endLiveClass(courseId) {
  const { data } = await api.delete(`/courses/${courseId}/live-class`);
  return data;
}

export async function getLiveClassToken(courseId) {
  const { data } = await api.get(`/courses/${courseId}/live-class/token`);
  return data;
}
