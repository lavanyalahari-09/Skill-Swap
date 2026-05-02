import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
  { to: '/matches', label: 'Matches' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/messages', label: 'Messages' }
];

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-8">
      <header className="glass sticky top-3 z-20 mx-auto flex max-w-7xl flex-col gap-4 rounded-2xl px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-lg font-black text-mango shadow-sm">
            SS
          </div>
          <div>
            <p className="eyebrow text-lagoon">Skill Swap</p>
            <h1 className="font-display text-xl font-extrabold leading-tight text-ink sm:text-2xl">Learn together. Grow faster.</h1>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  isActive ? 'bg-ink text-white shadow-sm' : 'bg-white text-ink ring-1 ring-ink/5 hover:bg-paper'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="rounded-xl bg-mango px-4 py-2 text-sm font-bold text-ink shadow-sm transition hover:bg-amber-500"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl py-7">
        <div className="mb-7 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div
                className="grid h-14 w-14 place-items-center rounded-xl text-xl font-black text-white shadow-sm"
                style={{ backgroundColor: user?.avatarColor || '#0f766e' }}
              >
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-lagoon">Welcome back</p>
                <p className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{user?.name}</p>
                <p className="mt-1 text-sm font-medium text-ink/55">Manage your profile, matches, messages, and reviews.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Learn', 'Teach', 'Connect'].map((item) => (
                <div key={item} className="rounded-xl border border-ink/10 bg-paper px-4 py-3">
                  <p className="text-xs font-bold text-ink/45">Mode</p>
                  <p className="font-extrabold text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
