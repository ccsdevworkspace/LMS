import { useCourseStore } from '../../stores/course'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { joinCourseSchema } from './CourseSchema'
import Modal from '../app/Modal'
import SuccessScreen from './SuccessScreen'
import Field from '../app/Field'

export default function JoinCourseModal({ open, closeModal }) {
  const joinCourse = useCourseStore((s) => s.joinCourse)
  const loading = useCourseStore((s) => s.loading)
  const [submitError, setSubmitError] = useState(null)
  const [joinedCourse, setJoinedCourse] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(joinCourseSchema),
    mode: 'onChange',
    defaultValues: { code: '' },
  })

  const code = useWatch({ control, name: 'code' }) ?? ''

  const onSubmit = async (data) => {
    setSubmitError(null)
    try {
      const course = await joinCourse({ code: data.code })
      setJoinedCourse(course)
    } catch (err) {
      setSubmitError(
        err?.response?.data?.error ||
        err?.message ||              
        'Could not join the course, try again.'  
      )
    }
  }

  const handleClose = () => {
    if (loading) return
    reset()
    setSubmitError(null)
    setJoinedCourse(null)
    closeModal()
  }

  return (
    <Modal
      open={open}
      closeModal={handleClose}
      fullScreen={!joinedCourse}
      title={joinedCourse ? undefined : 'Join Course'}
      subtitle={joinedCourse ? undefined : 'Enter the code provided by your instructor'}
    >
      {joinedCourse ? (
        <SuccessScreen
          action="joined"
          course={joinedCourse}
          onDone={handleClose}
        />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 p-2">
          <div>
            <label className='block text-sm font-semibold text-fg-muted mb-2'>Course Code</label>
            <Field
              placeholder="e.g., 6s3Vez"
              registration={register('code')}
              state={errors.code ? 'error' : code.length === 6 ? 'success' : 'default'}
              message={errors.code?.message}
            />
          </div>

          {submitError && (
            <p className="text-sm text-danger">{submitError}</p>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-fg transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || loading}
              className={`rounded-full bg-btn px-8 py-2.5 text-sm font-bold text-fg-inverse dark:text-fg transition 
                ${!isValid || loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-btn-hover'}`}
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
