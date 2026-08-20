const ACTIONS = {
  joined: { head: 'Class', accent: 'Joined.', accentClass: 'text-primary-600', image: '/join.webp', past: 'joined' },
  left: { head: 'Left', accent: 'Class.', accentClass: 'text-danger', image: '/leave.webp', past: 'left' },
  deleted: { head: 'Class', accent: 'Deleted.', accentClass: 'text-danger', image: '/join.webp', past: 'deleted' },
}

export default function SuccessScreen({ action, course, onDone }) {
  const { head, accent, accentClass, image, past } = ACTIONS[action]

  return (
    <main className="flex flex-row gap-4 sm:gap-8 items-center pt-2 pb-4">
      <aside className="flex flex-col flex-1 justify-center min-w-0">
        <h2 className="text-xl sm:text-3xl font-bold text-fg leading-[1.1] mb-3 sm:mb-4 tracking-tight">
          {head} <span className={accentClass}>{accent}</span>
        </h2>

        <p className="text-sm text-fg-muted mb-6 sm:mb-8 leading-relaxed">
          You have successfully {past}<br />
          <span className="font-semibold text-fg block truncate">{course.name} - <span className="font-normal text-fg-muted">{course.section}</span></span>
        </p>

        <button
          onClick={onDone}
          className="flex justify-center items-center border border-border text-fg font-semibold text-sm py-2.5 sm:py-3 px-6 bg-surface rounded-xl shadow-sm w-fit hover:bg-muted transition-all hover:cursor-pointer"
        >
          Done
        </button>
      </aside>

      <figure className="flex justify-center items-center shrink-0 w-32 sm:w-48">
        <img src={image} className="w-full h-auto object-contain" />
      </figure>
    </main>
  )
}
