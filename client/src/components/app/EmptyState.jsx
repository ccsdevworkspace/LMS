export default function EmptyState({
  icon: Icon,
  title,
  accent,
  description,
  descriptionClassName = 'text-sm sm:text-base text-fg-muted',
  children,
}) {
  return (
    <main className="grid h-full min-h-[60vh] w-full place-items-center p-4">
      <div className="flex flex-col items-center max-w-sm w-full gap-6 text-center">

        <header className="rounded-full bg-primary-100 p-5">
          <Icon className="h-10 w-10 text-primary-600" strokeWidth={1.5} />
        </header>

        <section className="space-y-1">
          <h1 className="text-2xl sm:text-3xl text-fg tracking-tight font-bold">
            {title} <span className="text-primary-600">{accent}</span>
          </h1>
          <p className={descriptionClassName}>{description}</p>
        </section>

        {children}

      </div>
    </main>
  )
}
