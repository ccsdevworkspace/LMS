import { useCourseStore } from '../../stores/course'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCourseSchema } from './CourseSchema'
import Modal from '../app/Modal'
import Field from '../app/Field'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const labelClass = 'block text-sm font-semibold text-fg-muted mb-2'

export default function CreateCourseModal({ open, closeModal }) {
  const createCourse = useCourseStore((s) => s.createCourse)
  const loading = useCourseStore((s) => s.loading)
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(createCourseSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      section: '',
      days: [],
      startTime: '',
      endTime: '',
    },
  })

  const {
    name = '',
    section = '',
    days = [],
    startTime = '',
    endTime = '',
  } = useWatch({ control }) || {}

  const toggleDay = (day) => {
    const isSelected = days.includes(day)
    const updatedDays = isSelected ? days.filter((d) => d !== day) : [...days, day]
    setValue('days', DAYS.filter((d) => updatedDays.includes(d)), { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    setSubmitError(null)
    try {
      await createCourse(data)
      reset()
      closeModal()
    } catch (err) {
      setSubmitError(
        err?.response?.data?.error ||  
        err?.message ||            
        'Please. Try again.' 
      )
    }
  }

  const handleClose = () => {
    if (loading) return
    reset()
    setSubmitError(null)
    closeModal()
  }

  return (
    <Modal
      open={open}
      closeModal={handleClose}
      title="Create Course"
      subtitle="Set up a new learning space"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* -----------COURSE----------- */}
        <div>
          <label htmlFor="course-name" className={labelClass}>Course name</label>
          <Field
            placeholder="e.g., Computational Science"
            registration={register('name')}
            state={errors.name ? 'error' : name.length >= 2 ? 'success' : 'default'}
            message={errors.name?.message}
          />
        </div>
        {/* -----------SECTION----------- */}
        <div>
          <label htmlFor="course-section" className={labelClass}>Section</label>
          <Field
            placeholder="e.g., BSCS 4A"
            registration={register('section')}
            state={errors.section ? 'error' : section.length >= 2 ? 'success' : 'default'}
            message={errors.section?.message}
          />
        </div>
        {/* -----------DAYS----------- */}
        <fieldset>
          <legend className={labelClass}>Schedule</legend>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {DAYS.map((day) => {
              const isSelected = days.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-full rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-success bg-success/10'
                      : 'border-border bg-surface text-fg-subtle hover:bg-muted hover:text-fg'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          {errors.days?.message && (
            <p className="text-sm text-danger mt-2">{errors.days.message}</p>
          )}
        </fieldset>
        {/* -----------TIME----------- */}
        <fieldset>
          <legend className={labelClass}>Timeslot</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}
              className="w-full cursor-pointer"
            >
              <Field
                type="time"
                registration={register('startTime')}
                state={errors.startTime ? 'error' : startTime ? 'success' : 'default'}
                message={errors.startTime?.message}
              />
            </div>
            
            <div
              onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}
              className="w-full cursor-pointer"
            >
              <Field
                type="time"
                registration={register('endTime')}
                state={errors.endTime ? 'error' : endTime ? 'success' : 'default'}
                message={errors.endTime?.message}
              />
            </div>
          </div>
        </fieldset>

        {submitError && (
          <p className="text-sm text-danger">{submitError}</p>
        )}
        {/* -----------CTA----------- */}
        <div className="mt-2 flex items-center justify-end gap-3 pt-5">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-fg transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid || loading}
            className={`rounded-full bg-btn px-8 py-2.5 text-sm font-bold text-fg-inverse dark:text-fg transition ${
              !isValid || loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-btn-hover'
            }`}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>

      </form>
    </Modal>
  )
}
