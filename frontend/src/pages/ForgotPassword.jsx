import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../lib/authApi.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await requestPasswordReset(email);
      setSuccess(data.message || 'Password reset link sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-6 lg:grid lg:place-items-center lg:py-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-ink/10 bg-white p-7 shadow-soft sm:p-8">
        <p className="eyebrow text-lagoon">Password help</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink">Forgot password?</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-ink/60">
          Enter your email and we will send you a secure reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block">
            <span className="text-sm font-extrabold text-ink">Email</span>
            <input
              required
              type="email"
              className="field mt-2 h-12"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-lagoon to-ink px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/" className="mt-5 inline-block text-sm font-extrabold text-lagoon transition hover:text-ink">
          Back to login
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
