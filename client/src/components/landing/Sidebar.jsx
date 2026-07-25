export default function Sidebar() {
  return (
    <aside className="hidden sm:flex flex-col justify-between items-center min-h-screen w-20 shrink-0 py-12 border-r border-border bg-soft/80 sticky top-0 z-20">
      {/* B.F.F */}
      <section className="flex-1 flex items-center justify-center mt-12">
          <div className="text-fg-muted font-medium tracking-[0.2em] text-sm [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
            Bridge · Foster · Flourish
          </div>
      </section>
      
      {/* logo */}
      <figure className="flex items-center justify-center w-12 h-12 mt-12 rounded-full shrink-0 overflow-hidden">
        <img src="/logo.webp" className="w-8 h-8 object-contain" />
      </figure>
    </aside>
  );
}
