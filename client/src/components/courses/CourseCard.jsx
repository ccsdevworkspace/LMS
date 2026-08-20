import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function CourseCard({ course }) {
  const [copied, setCopied] = useState(false)  
  
  const copyCode = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    await navigator.clipboard.writeText(course.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1670)
  }

  return (
  <Link
  to={`/courses/${course.id}`}
  className="group block bg-card p-6 border border-border rounded-2xl transition hover:border-border-hover hover:shadow-sm hover:bg-primary-100/67 active:bg-primary-100/67"
  >
    <header className="flex justify-between items-start gap-4">
      <div>
        <h3 className="text-xl text-fg font-bold">{course.name}</h3>
        <p className="text-xs text-primary-600 font-bold tracking-wide mt-1 uppercase">
          {course.section}
        </p>
      </div>
      
      <button
      onClick={copyCode}
      title="Copy Code"
      className="border border-border bg-muted rounded-lg px-2 py-1 font-mono text-xs font-semibold tracking-wider text-fg transition-colors hover:border-primary-600 hover:bg-primary-600 hover:text-fg-inverse"
      >
        {copied ? 'Copied!' : course.joinCode}
      </button>
    </header>
    
    <hr className="border-border my-4" />
    <p className="text-sm text-fg-muted">{course.createdBy?.fullName}</p>
    <p className="text-sm text-fg-subtle mt-1">
      {course.days.join(' & ')} - {course.startTime} to {course.endTime}
    </p>
  </Link>
  )
}