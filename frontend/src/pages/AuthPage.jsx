import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register(form);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Cannot reach the server. Please make sure the backend is running on http://localhost:5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-6 lg:grid lg:place-items-center lg:py-10">
      <section className="float-in mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink/5 lg:min-h-[42rem] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="dark-panel aurora-shell hidden min-h-full flex-col justify-between p-10 text-white lg:flex">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-extrabold text-mango shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-mango" />
              Skill Swap
            </div>
            <h1 className="mt-9 max-w-lg font-display text-5xl font-extrabold leading-tight">
              Exchange skills, not money
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-white/70">
              Find peers who can teach what you want to learn, and share what you already know.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Match with learners who have complementary skills.',
                'Keep requests, chats, and feedback in one workspace.',
                'Build trust through accepted connections and reviews.'
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mango text-xs font-black text-ink">
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="m3.25 8.15 2.9 2.9 6.6-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold leading-6 text-white/75">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8">
            <div className="h-52 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-sm backdrop-blur">
              <div className="flex h-full items-center justify-center">
                <div className="relative h-36 w-36 rounded-full border border-mango/40 bg-mango/10">
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mango shadow-[0_0_50px_rgba(245,158,11,0.35)]" />
                  <div className="absolute -left-4 top-8 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 font-black text-mango ring-1 ring-white/15">T</div>
                  <div className="absolute -right-4 bottom-8 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 font-black text-white ring-1 ring-white/15">L</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-full lg:px-12">
          <form onSubmit={submit} className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="eyebrow text-lagoon">Skill Swap</p>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink">
                Exchange skills, not money
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-ink/60">
                Learn from peers and share what you know.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white/95 p-6 shadow-soft sm:p-8">
              <p className="eyebrow text-lagoon">
                {mode === 'login' ? 'Welcome back' : 'Join the swap'}
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink">
                {mode === 'login' ? 'Login' : 'Create account'}
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-ink/60">
                {mode === 'login'
                  ? 'Access your matches, messages, and learning sessions.'
                  : 'Create your profile and start discovering compatible peers.'}
              </p>

              <div className="mt-8 space-y-5">
                {mode === 'register' && (
                  <label className="block">
                    <span className="text-sm font-extrabold text-ink">Name</span>
                    <input
                      required
                      className="field mt-2 h-12"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-sm font-extrabold text-ink">Email</span>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4.5 6.75h15v10.5h-15V6.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="m5.25 7.5 6.75 5.25 6.75-5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <input
                      required
                      type="email"
                      className="field field-with-leading-icon h-12"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                  </div>
                </label>

                <label className="block">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-extrabold text-ink">Password</span>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm font-extrabold text-lagoon transition hover:text-ink"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M7.25 10.75V8.5a4.75 4.75 0 0 1 9.5 0v2.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M6.5 10.75h11A1.5 1.5 0 0 1 19 12.25v5A1.5 1.5 0 0 1 17.5 18.75h-11A1.5 1.5 0 0 1 5 17.25v-5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <input
                      required
                      minLength={6}
                      type={showPassword ? 'text' : 'password'}
                      className="field field-with-both-icons h-12"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-extrabold text-ink/55 transition hover:bg-teal-50 hover:text-lagoon"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 text-sm font-bold text-ink/65">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-ink/20 text-lagoon focus:ring-lagoon"
                  />
                  Remember me
                </label>
              </div>

              {error && (
                <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                  {error}
                </p>
              )}

              <button
                className="mt-7 w-full rounded-xl bg-gradient-to-r from-lagoon to-ink px-5 py-3.5 font-extrabold text-white shadow-[0_14px_30px_rgba(15,118,110,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,118,110,0.3)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? 'Signing in...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode(mode === 'login' ? 'register' : 'login');
                }}
                className="mt-6 w-full rounded-xl bg-amber-50 px-4 py-3 font-extrabold text-ink transition hover:bg-amber-100 active:scale-[0.99]"
              >
                {mode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
              </button>

              <p className="mt-6 text-center text-xs font-medium leading-5 text-ink/45">
                By continuing, you agree to Skill Swap's Terms and Privacy Policy.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
