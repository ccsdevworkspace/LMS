import { create } from 'zustand'
import {
  getCourseMessages,
  sendCourseMessage,
  deleteCourseMessage,
} from '../../api/discussion'

export const useDiscussionStore = create((set, get) => ({
  messages: [],
  loading: false,
  sending: false,
  error: null,

  fetchMessages: async (courseId) => {
    try {
      const data = await getCourseMessages(courseId)
      set({ messages: data.messages || [], error: null })
      return data.messages
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      set({ error: err.response?.data?.error || err.message })
    }
  },

  loadInitialMessages: async (courseId) => {
    set({ loading: true, error: null })
    try {
      const data = await getCourseMessages(courseId)
      set({ messages: data.messages || [], loading: false })
      return data.messages
    } catch (err) {
      console.error('Failed to load initial messages:', err)
      set({
        error: err.response?.data?.error || err.message,
        loading: false,
      })
    }
  },

  sendMessage: async (courseId, content, currentUser) => {
    if (!content?.trim()) return

    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      courseId,
      content,
      createdAt: new Date().toISOString(),
      senderId: currentUser?.id,
      sender: {
        id: currentUser?.id,
        fullName: currentUser?.fullName || 'You',
        avatarUrl: currentUser?.avatarUrl || null,
      },
      isOptimistic: true,
    }

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
      sending: true,
    }))

    try {
      const res = await sendCourseMessage(courseId, content)
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? res.message : m
        ),
        sending: false,
      }))
      return res.message
    } catch (err) {
      console.error('Failed to send message:', err)
      // Rollback optimistic message on failure
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
        sending: false,
        error: err.response?.data?.error || 'Failed to send message',
      }))
      throw err
    }
  },

  deleteMessage: async (courseId, messageId) => {
    try {
      await deleteCourseMessage(courseId, messageId)
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }))
    } catch (err) {
      console.error('Failed to delete message:', err)
      throw err
    }
  },

  clearMessages: () => {
    set({ messages: [], loading: false, sending: false, error: null })
  },
}))
