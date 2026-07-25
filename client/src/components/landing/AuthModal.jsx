import { X } from 'lucide-react'

export default function AuthModal({ open, closeModal, handleLogin }) {
  if (!open) return null;

  return (
    <main className="flex flex-col lg:flex lg:items-center lg:justify-center lg:p-4 fixed inset-0 z-50">
      {/* backdrop overlay */}
      <div 
        className="absolute inset-0 bg-app/80"
        onClick={closeModal}
      >
      </div>

      {/* modal */}
      <section className="relative bg-modal w-full h-full lg:h-auto lg:max-w-215 lg:rounded-4xl lg:shadow-lg lg:border lg:border-border p-8 lg:p-16 flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch z-10 overflow-y-auto overflow-x-hidden">
        <button 
          onClick={closeModal}
          className="flex items-center justify-center rounded-full absolute top-4 right-4 lg:top-6 lg:right-6 w-10 h-10 bg-surface shadow-md border border-border text-fg-muted hover:bg-muted hover:text-fg transition-colors cursor-pointer"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <aside className="flex flex-col pt-2 shrink-0">
          <h2 className="text-3xl lg:text-5xl font-bold text-fg leading-[1.1] mb-4 lg:mb-6 tracking-tight">
            Your Learning<br />
            <span className="text-primary-600">Starts Here.</span>
          </h2>
          
          <p className="text-base lg:text-lg text-fg-muted mb-8 lg:mb-12 leading-relaxed">
            Access your learning dashboard<br />
            with your Google account.
          </p>
          
          <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-4 bg-surface border border-border text-fg font-semibold text-lg py-4 px-8 rounded-xl shadow-sm w-fit hover:bg-muted transition-all hover:cursor-pointer"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" />
            Continue with Google
          </button>
        </aside>

        <figure className="flex-1 lg:flex-none mt-8 rounded-xl lg:mt-2 w-full lg:w-100 shrink-0">
          <img src="/modal.webp" className="w-full h-full object-contain" />
        </figure>
      </section>
    </main>
  );
}
