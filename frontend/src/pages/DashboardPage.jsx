import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import api from '../lib/api.js';

const DashboardPage = () => {
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/skills'), api.get('/matches/discover'), api.get('/connections')]).then(
      ([skillRes, matchRes, connectionRes]) => {
        setSkills(skillRes.data);
        setMatches(matchRes.data);
        setConnections(connectionRes.data);
      }
    );
  }, []);

  const teachCount = skills.filter((skill) => skill.type === 'teach').length;
  const learnCount = skills.filter((skill) => skill.type === 'learn').length;
  const acceptedCount = connections.filter((connection) => connection.status === 'accepted').length;
  const pendingCount = connections.filter((connection) => connection.status === 'pending').length;
  const profileStrength = Math.min(100, (teachCount > 0 ? 35 : 0) + (learnCount > 0 ? 35 : 0) + (acceptedCount > 0 ? 30 : 0));
  const nextActions = [
    {
      title: teachCount ? 'Improve teaching profile' : 'Add a teach skill',
      helper: teachCount ? 'Add detail to make your offered skills easier to trust.' : 'List one skill you can confidently teach.'
    },
    {
      title: learnCount ? 'Review compatible peers' : 'Add a learning goal',
      helper: learnCount ? 'Open matches and send a request to a strong peer.' : 'Add one skill you want to learn next.'
    },
    {
      title: acceptedCount ? 'Plan a learning session' : 'Accept or request a connection',
      helper: acceptedCount ? 'Use messages to coordinate time and topic.' : 'Connections unlock real-time chat and feedback.'
    }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <p className="eyebrow text-lagoon">Dashboard overview</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              Make every skill exchange easier to track.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-ink/60">
              Monitor your teach skills, learning goals, active requests, and matches from one focused workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/profile" className="btn-primary">Update profile</a>
              <a href="/matches" className="rounded-xl border border-ink/10 bg-white px-5 py-3 font-extrabold text-ink transition hover:bg-paper">
                View matches
              </a>
            </div>
          </div>
          <div className="border-t border-ink/10 bg-ink p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white/55">Profile strength</p>
                <p className="mt-1 font-display text-5xl font-extrabold text-mango">{profileStrength}%</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                <p className="text-sm text-white/55">Pending</p>
                <p className="text-3xl font-extrabold">{pendingCount}</p>
              </div>
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mango to-teal-300"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            <p className="mt-4 text-sm font-bold text-white/65">
              Add both teach and learn skills, then build accepted connections to improve this score.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Teach Skills" value={teachCount} tone="bg-white" helper="Skills you offer" accent="bg-lagoon" />
        <StatCard label="Learn Goals" value={learnCount} tone="bg-white" helper="Skills you want" accent="bg-mango" />
        <StatCard label="Matches" value={matches.length} tone="bg-white" helper="Compatible peers" accent="bg-teal-300" />
        <StatCard label="Connections" value={connections.length} tone="bg-white" helper={`${acceptedCount} accepted`} accent="bg-amber-400" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="panel rounded-2xl p-6">
          <div>
            <p className="eyebrow text-lagoon">Next actions</p>
            <h3 className="mt-2 font-display text-3xl font-extrabold">Keep momentum</h3>
          </div>
          <div className="mt-5 space-y-3">
            {nextActions.map((action, index) => (
              <div key={action.title} className="flex gap-4 rounded-2xl border border-ink/5 bg-white p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-extrabold text-mango">
                  0{index + 1}
                </div>
                <div>
                  <p className="font-extrabold text-ink">{action.title}</p>
                  <p className="mt-1 text-sm font-medium text-ink/55">{action.helper}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <section className="panel rounded-2xl p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-lagoon">Exchange flow</p>
              <h3 className="font-display text-3xl font-extrabold">From match to feedback</h3>
            </div>
            <p className="max-w-md text-sm font-medium text-ink/55">A clean path helps learners move from discovery to an actual session.</p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {['Create profile', 'Add skills', 'Find matches', 'Connect and learn'].map((step, index) => (
              <div key={step} className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-lagoon">Step {index + 1}</p>
                <p className="mt-3 min-h-12 font-extrabold text-ink">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-paper p-4">
            <p className="text-sm font-extrabold text-ink">Current focus</p>
            <p className="mt-1 text-sm font-medium text-ink/60">
              {matches.length > 0 ? 'You have compatible peers ready for connection requests.' : 'Add more skills to discover compatible peers.'}
            </p>
          </div>
        </section>
      </section>

      {matches.length === 0 && (
        <EmptyState
          title="No matches yet"
          text="Add a few skills you can teach and want to learn. The matching system will compare them with other users."
        />
      )}
    </div>
  );
};

export default DashboardPage;
