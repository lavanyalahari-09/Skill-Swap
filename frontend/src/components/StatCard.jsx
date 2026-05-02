const StatCard = ({ label, value, tone = 'bg-white', helper = 'Active now', accent = 'bg-lagoon' }) => (
  <article className={`stagger-in rounded-2xl border border-ink/10 ${tone} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/50">{label}</p>
        <p className="mt-3 font-display text-4xl font-extrabold leading-none text-ink">{value}</p>
      </div>
      <span className={`h-3 w-3 rounded-full ${accent}`} />
    </div>
    <p className="mt-4 border-t border-ink/5 pt-3 text-sm font-bold text-ink/55">{helper}</p>
  </article>
);

export default StatCard;
