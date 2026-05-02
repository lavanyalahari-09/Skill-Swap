const EmptyState = ({ title, text }) => (
  <div className="panel rounded-[2rem] border-2 border-dashed border-lagoon/30 p-8 text-center">
    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-teal-50 text-2xl font-black text-lagoon">
      SS
    </div>
    <p className="font-display text-3xl font-black">{title}</p>
    <p className="mx-auto mt-2 max-w-xl text-ink/65">{text}</p>
  </div>
);

export default EmptyState;
