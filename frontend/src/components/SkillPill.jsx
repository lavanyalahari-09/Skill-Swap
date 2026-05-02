const SkillPill = ({ skill, onDelete }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/5 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5">
    <div className="flex items-start gap-3">
      <div className={`mt-1 h-3 w-3 rounded-full ${skill.type === 'teach' ? 'bg-lagoon' : 'bg-mango'}`} />
      <div>
      <p className="font-extrabold text-ink">{skill.skillName}</p>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-lagoon">{skill.level}</p>
      {skill.description && <p className="mt-1 text-sm text-ink/60">{skill.description}</p>}
      </div>
    </div>
    {onDelete && (
      <button onClick={() => onDelete(skill._id)} className="rounded-lg bg-red-50 px-3 py-1 text-sm font-bold text-red-700 transition hover:bg-red-100">
        Remove
      </button>
    )}
  </div>
);

export default SkillPill;
