import { create } from 'zustand'
import {
    listCourses,
    createCourse,
    getCourse,
    deleteCourse,
    joinCourse,
    leaveCourse,
    getMembers,
    removeMember
} from '../../api/course'

export const useCourseStore = create((set) => ({
  courses: [],
  currentCourse: null,
  members: [],
  loading: false,

  fetchCourses: async () => {
    set({ loading: true })
    try {
      const data = await listCourses()
      set({ courses: data.courses })
    } finally {
      set({ loading: false })
    }
  },

  createCourse: async (courseData) => {
    set({ loading: true })
    try {
      const newCourse = (await createCourse(courseData)).course
      set((state) => ({
        courses: [newCourse, ...state.courses],
      }))
      return newCourse
    } finally {
      set({ loading: false })
    }
  },

  getCourse: async (id) => {
    set({ loading: true })
    try {
      const currentCourse = (await getCourse(id)).course
      set({ currentCourse })
      return currentCourse
    } finally {
      set({ loading: false })
    }
  },

  deleteCourse: async (id) => {
    set({ loading: true })
    try {
      await deleteCourse(id)
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
      }))
    } finally {
      set({ loading: false })
    }
  },

  joinCourse: async (joinData) => {
    set({ loading: true })
    try {
      const newCourse = (await joinCourse(joinData)).course
      set((state) => ({
        courses: [newCourse, ...state.courses],
      }))
      return newCourse
    } finally {
      set({ loading: false })
    }
  },

  leaveCourse: async (id) => {
    set({ loading: true })
    try {
      await leaveCourse(id)
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
      }))
    } finally {
      set({ loading: false })
    }
  },

  getMembers: async (id) => {
    set({ loading: true })
    try {
      const members = (await getMembers(id)).members
      set({ members })
      return members
    } finally {
      set({ loading: false })
    }
  },

  removeMember: async (courseId, userId) => {
    set({ loading: true })
    try {
      await removeMember(courseId, userId)
      set((state) => ({
        members: state.members.filter((m) => m.id !== userId),
      }))
    } finally {
      set({ loading: false })
    }
  },
}))
