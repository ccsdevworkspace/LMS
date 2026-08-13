export default function Panel({ label, className = "", children }) {
  return (
    <section className={`border border-border bg-card rounded-2xl overflow-hidden ${className}`}>
      {label && (
        <h2 className="uppercase text-xs font-bold text-primary-600 tracking-wide px-6 pt-6">
          {label}
        </h2>
      )}
      {children}
    </section>
  );
}