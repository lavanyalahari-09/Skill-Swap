import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

const MatchesPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [notice, setNotice] = useState('');
  const [sendingTo, setSendingTo] = useState('');
  const [disconnectingId, setDisconnectingId] = useState('');

  const load = async () => {
    const [matchRes, connectionRes] = await Promise.all([
      api.get('/matches/discover'),
      api.get('/connections')
    ]);
    setMatches(matchRes.data);
    setConnections(connectionRes.data);
  };

  useEffect(() => {
    const loadPage = async () => {
      const [matchRes, connectionRes] = await Promise.all([
        api.get('/matches/discover'),
        api.get('/connections')
      ]);
      setMatches(matchRes.data);
      setConnections(connectionRes.data);
    };

    loadPage();
  }, []);

  const connect = async (match) => {
    try {
      setSendingTo(match.user._id);
      const { data: savedMatch } = await api.post('/matches', {
        userId: match.user._id,
        matchedSkills: match.matchedSkills,
        score: match.score
      });
      const { data: connection } = await api.post('/connections', { recipient: match.user._id, matchId: savedMatch._id });
      setConnections((current) => {
        const withoutOld = current.filter((item) => item._id !== connection._id);
        return [connection, ...withoutOld];
      });
      setNotice(`Connection request sent to ${match.user.name}`);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to send connection request');
    } finally {
      setSendingTo('');
    }
  };

  const updateConnection = async (id, status) => {
    await api.put(`/connections/${id}`, { status });
    load();
  };

  const disconnectConnection = async (connection) => {
    try {
      setDisconnectingId(connection._id);
      await api.delete(`/connections/${connection._id}`);
      setConnections((current) => current.filter((item) => item._id !== connection._id));
      const peer = connection.requester._id === user._id ? connection.recipient : connection.requester;
      setNotice(`Disconnected from ${peer.name}`);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to disconnect connection');
    } finally {
      setDisconnectingId('');
    }
  };

  const connectionForUser = (userId) =>
    connections.find(
      (connection) => connection.requester._id === userId || connection.recipient._id === userId
    );

  const statusLabel = (status) => {
    if (status === 'pending') return 'Request sent';
    if (status === 'accepted') return 'Connected';
    if (status === 'rejected') return 'Send request again';
    return 'Send connection request';
  };

  const formatSkillName = (skillName = 'this skill') =>
    skillName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const exchangeDetail = (skill, peerName) => {
    if (skill.direction?.startsWith(`${peerName} can teach`)) {
      return {
        label: 'Learn',
        text: `You can learn ${formatSkillName(skill.learnerSkill)} from ${peerName}`
      };
    }

    return {
      label: 'Teach',
      text: `You can teach ${formatSkillName(skill.teacherSkill || skill.learnerSkill)} to ${peerName}`
    };
  };

  return (
    <div className="space-y-8">
      <section className="dark-panel aurora-shell rounded-2xl p-7 text-white shadow-soft">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-mango">Matching system</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">Compatible learners</h2>
            <p className="mt-3 max-w-3xl text-white/70">
              The algorithm compares your skills wanted with other users' skills offered, and your skills offered with what they want to learn.
            </p>
          </div>
          <div className="metric-tile rounded-2xl p-5">
            <p className="text-sm text-white/55">Matches found</p>
            <p className="font-display text-4xl font-extrabold text-mango">{matches.length}</p>
          </div>
        </div>
      </section>

      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 font-extrabold text-lagoon">{notice}</p>}

      <section className="grid gap-5 lg:grid-cols-2">
        {matches.map((match) => {
          const existingConnection = connectionForUser(match.user._id);
          const canSendRequest = !existingConnection || existingConnection.status === 'rejected';
          const buttonDisabled = !canSendRequest || sendingTo === match.user._id;
          return (
          <article key={match.user._id} className="stagger-in premium-card orbital-card group rounded-2xl p-6 transition hover:-translate-y-0.5">
            <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-lagoon text-xl font-black text-white shadow-sm">
                  {match.user.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold">{match.user.name}</p>
                  <p className="text-ink/60">{match.user.location || 'Location not added'}</p>
                </div>
              </div>
              <span className="rounded-xl bg-mango px-4 py-2 text-sm font-extrabold text-ink">
                Score {match.score}
              </span>
            </div>
            <p className="mt-4 text-ink/70">{match.user.bio || 'This user has not added a bio yet.'}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {match.matchedSkills.map((skill, index) => {
                const detail = exchangeDetail(skill, match.user.name);
                return (
                  <span
                    key={`${skill.direction}-${index}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-extrabold text-lagoon"
                  >
                    <span className="rounded-md bg-white px-2 py-1 text-xs text-ink/60">{detail.label}</span>
                    {detail.text}
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => connect(match)}
              disabled={buttonDisabled}
              className={`mt-6 rounded-2xl px-6 py-4 font-extrabold transition ${
                existingConnection?.status === 'accepted'
                  ? 'bg-teal-50 text-lagoon ring-1 ring-teal-100'
                  : existingConnection?.status === 'pending'
                    ? 'bg-amber-100 text-ink ring-1 ring-amber-200'
                    : 'btn-primary'
              } disabled:cursor-not-allowed disabled:opacity-80`}
            >
              {sendingTo === match.user._id ? 'Sending...' : statusLabel(existingConnection?.status)}
            </button>
            </div>
          </article>
          );
        })}
      </section>

      {matches.length === 0 && (
        <EmptyState title="No compatible users yet" text="Ask a classmate to register and add opposite teach/learn skills to see matches here." />
      )}

      <section className="panel rounded-2xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-lagoon">Requests</p>
            <h3 className="font-display text-3xl font-extrabold">Connection Requests</h3>
          </div>
          <p className="text-ink/60">Accept a request to unlock messaging.</p>
        </div>
        <div className="mt-5 grid gap-4">
          {connections.map((connection) => (
            <div key={connection._id} className="flex flex-col justify-between gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm md:flex-row md:items-center">
              <div>
                <p className="font-extrabold">
                  {connection.requester.name} -&gt; {connection.recipient.name}
                </p>
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-lagoon">{connection.status}</p>
              </div>
              {connection.status === 'pending' && connection.recipient._id === user._id && (
                <div className="flex gap-2">
                  <button onClick={() => updateConnection(connection._id, 'accepted')} className="rounded-xl bg-lagoon px-4 py-2 font-extrabold text-white">
                    Accept
                  </button>
                  <button onClick={() => updateConnection(connection._id, 'rejected')} className="rounded-xl bg-red-100 px-4 py-2 font-extrabold text-red-700">
                    Reject
                  </button>
                </div>
              )}
              {connection.status === 'accepted' && (
                <button
                  onClick={() => disconnectConnection(connection)}
                  disabled={disconnectingId === connection._id}
                  className="rounded-xl bg-red-100 px-4 py-2 font-extrabold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {disconnectingId === connection._id ? 'Disconnecting...' : 'Disconnect'}
                </button>
              )}
            </div>
          ))}
          {connections.length === 0 && (
            <p className="rounded-2xl border border-dashed border-ink/10 bg-white p-4 font-bold text-ink/55">
              No connection requests yet.
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

export default MatchesPage;
