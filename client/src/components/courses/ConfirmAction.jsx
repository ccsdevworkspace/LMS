import { useState } from 'react'
import { useCourseStore } from '../../stores/course'
import { ArrowRight } from 'lucide-react'
import Modal from '../app/Modal'

export default function ConfirmAction({ icon: Icon, label, title, subtitle, confirmLabel, loadingLabel, onConfirm }) {
  const loading = useCourseStore((s) => s.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = async () => {
    try {
      await onConfirm()
      setConfirmOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        title={label}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border p-2 text-sm font-bold text-fg-muted transition hover:border-fg/30 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon size={16} />
      </button>

      <Modal
        open={confirmOpen}
        closeModal={() => setConfirmOpen(false)}
        title={title}
        subtitle={subtitle}
        fullScreen={false}
      >
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-fg transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="group flex items-center gap-2 rounded-full bg-btn px-8 py-2.5 text-sm font-bold text-fg-inverse dark:text-fg transition hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? loadingLabel : confirmLabel}
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>
      </Modal>
    </>
  )
}
