import { create } from 'zustand'
import {
  listTasks,
  getTask,
  getLatestTask,
  listMyTasks,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  getSubmissions,
  gradeSubmission,
} from '../../api/task'

export const useTaskStore = create((set) => ({
  courseTasks: [],
  task: null,
  currentTask: null,
  submission: null,
  submissions: null,
  latestTask: null,
  myTasks: [],
  tasksToGrade: [],

  isLoadingCourseTasks: false,
  isLoadingTask: false,
  isLoadingMyTasks: false,
  isLoadingSubmissions: false,
  isSavingTask: false,
  isSubmitting: false,
  isGrading: false,
  loading: false,

  fetchMyTasks: async () => {
    set({ isLoadingMyTasks: true, loading: true })
    try {
      const { tasks, grading } = await listMyTasks()
      set({ myTasks: tasks, tasksToGrade: grading || [] })
    } finally {
      set({ isLoadingMyTasks: false, loading: false })
    }
  },

  fetchLatestTask: async () => {
    const { task } = await getLatestTask()
    set({ latestTask: task })
  },

  fetchCourseTasks: async (courseId) => {
    set({ isLoadingCourseTasks: true, loading: true })
    try {
      const { tasks } = await listTasks(courseId)
      set({ courseTasks: tasks })
    } finally {
      set({ isLoadingCourseTasks: false, loading: false })
    }
  },

  fetchTask: async (id) => {
    set({ isLoadingTask: true, loading: true, task: null, currentTask: null, submission: null })
    try {
      const { task, submission } = await getTask(id)
      set({
        task,
        currentTask: task,
        submission: submission ?? null,
      })
      return { task, submission }
    } finally {
      set({ isLoadingTask: false, loading: false })
    }
  },

  createTask: async (courseId, data) => {
    set({ isSavingTask: true, loading: true })
    try {
      const { task } = await createTask(courseId, data)
      set((state) => ({ courseTasks: [task, ...state.courseTasks] }))
      return task
    } finally {
      set({ isSavingTask: false, loading: false })
    }
  },

  updateTask: async (id, data) => {
    set({ isSavingTask: true, loading: true })
    try {
      const { task } = await updateTask(id, data)
      set((state) => ({
        task,
        currentTask: task,
        courseTasks: state.courseTasks.map((item) => (item.id === id ? task : item)),
      }))
      return task
    } finally {
      set({ isSavingTask: false, loading: false })
    }
  },

  deleteTask: async (id) => {
    set({ isSavingTask: true, loading: true })
    try {
      await deleteTask(id)
      set((state) => ({
        courseTasks: state.courseTasks.filter((item) => item.id !== id),
        task: state.task?.id === id ? null : state.task,
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
      }))
    } finally {
      set({ isSavingTask: false, loading: false })
    }
  },

  submitTask: async (taskId, data) => {
    set({ isSubmitting: true, loading: true })
    try {
      const { submission } = await submitTask(taskId, data)
      set({ submission })
      return submission
    } finally {
      set({ isSubmitting: false, loading: false })
    }
  },

  fetchSubmissions: async (taskId) => {
    set({ isLoadingSubmissions: true, loading: true, submissions: null })
    try {
      const data = await getSubmissions(taskId)
      set({ submissions: data })
    } finally {
      set({ isLoadingSubmissions: false, loading: false })
    }
  },

  gradeSubmission: async (taskId, studentId, gradeData) => {
    set({ isGrading: true, loading: true })
    try {
      const { submission } = await gradeSubmission(taskId, studentId, gradeData)

      set((state) => {
        if (!state.submissions) return {}

        const students = state.submissions.students.map((student) =>
          student.id === studentId ? { ...student, submission } : student,
        )
        const submittedCount = students.filter((s) => s.submission).length

        return {
          submissions: {
            ...state.submissions,
            students,
            summary: {
              ...state.submissions.summary,
              submittedCount,
              pendingCount: students.length - submittedCount,
              gradedCount: students.filter((s) => s.submission?.status === 'GRADED').length,
              needsGradingCount: students.filter((s) => s.submission?.status === 'SUBMITTED').length,
            },
          },
        }
      })

      return submission
    } finally {
      set({ isGrading: false, loading: false })
    }
  },
}))