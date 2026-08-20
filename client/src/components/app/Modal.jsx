import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, closeModal, title, subtitle, children, fullScreen = true }) {
  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => e.key === 'Escape' && closeModal()
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, closeModal])

  if (!open) return null

  return (
    <main className={`flex flex-col fixed inset-0 z-50 
      ${ fullScreen ? 'lg:flex lg:justify-center lg:items-center lg:p-4' : 'flex justify-center items-center p-4' }`}>
        <div 
        className="absolute inset-0 bg-app/80" 
        onClick={closeModal}
        />
        <section className={`relative z-10 flex flex-col w-full ${
          fullScreen
          ? 'h-full lg:h-auto lg:max-w-lg lg:rounded-2xl lg:border lg:border-border lg:shadow-xl'
          : 'h-auto max-w-lg rounded-2xl border border-border shadow-xl'
          } bg-modal p-6 overflow-y-auto overflow-x-hidden`}>
            <div className="flex items-start justify-between mb-6 shrink-0">
              <div>
                {title && <h2 className="text-xl font-bold text-fg">{title}</h2>}
                {subtitle && <p className="mt-1 text-sm text-fg-subtle">{subtitle}</p>}
              </div>
              <button
              onClick={closeModal}
              title='Esc'
              className="flex justify-center items-center rounded-full text-fg-subtle h-8 w-8 transition hover:bg-muted hover:text-fg"
              >
                <X size={20} />
              </button>
            </div>
            {children}
        </section>
    </main>
  )
}