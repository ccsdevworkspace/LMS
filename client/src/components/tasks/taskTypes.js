import { FileText, PenLine, ClipboardCheck } from 'lucide-react'

// uploaded files are saved as {uuid}-originalName
const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/
const msPerDay = 24 * 60 * 60 * 1000

const TASK_TYPES = {
  ASSIGNMENT: {
    label: 'Assignment',
    description: 'Homework, projects, and file submissions',
    icon: FileText,
    badge: 'bg-primary-600/10 text-primary-600 dark:text-primary-400',
    tile: 'bg-primary-100 text-primary-600',
  },
  ACTIVITY: {
    label: 'Activity',
    description: 'Classroom exercises and practical tasks',
    icon: PenLine,
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  ASSESSMENT: {
    label: 'Assessment',
    description: 'Quizzes, tests, and periodic exams',
    icon: ClipboardCheck,
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    tile: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  },
}

function getTaskType(type) {
  return TASK_TYPES[type] || TASK_TYPES.ASSIGNMENT
}

// Feb 17
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Feb 17, 09:00 AM
function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getFileName(urlOrPath) {
  if (!urlOrPath) return 'File'

  const path = urlOrPath.split('?')[0]
  const fileName = decodeURIComponent(path.split('/').pop())

  return fileName.replace(UUID_PREFIX, '') || 'File'
}

// 2026-10-12 | 14:30 
function toDeadline(date, time) {
  if (!date) return undefined
  return new Date(`${date}T${time || '23:59'}:00`).toISOString()
}

function isOverdue(task) {
  if (!task.deadline) return false
  return new Date(task.deadline) < new Date()
}

// returns null if there's no deadline then -1 if it already passed
function getDaysLeft(deadline) {
  if (!deadline) return null
  const msLeft = new Date(deadline) - new Date()
  if (msLeft < 0) return -1

  return Math.ceil(msLeft / msPerDay)
}

export { 
  TASK_TYPES, 
  getTaskType, 
  formatDate, 
  formatDateTime, 
  getFileName, 
  toDeadline, 
  isOverdue, 
  getDaysLeft 
}
