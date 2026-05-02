import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ reviewee: '', rating: '5', comment: '' });
  const [notice, setNotice] = useState('');

  const loadReviews = async () => {
    const { data } = await api.get(`/reviews/${user._id}`);
    setReviews(data);
  };

  const load = async () => {
    const { data } = await api.get('/connections');
    setConnections(data);
    loadReviews();
  };

  useEffect(() => {
    load();
  }, []);

  const connectedPeers = connections
    .filter((connection) => connection.status === 'accepted')
    .map((connection) => (connection.requester._id === user._id ? connection.recipient : connection.requester));

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.reviewee) return;

    await api.post('/reviews', {
      reviewee: reviewForm.reviewee,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim()
    });

    setReviewForm({ reviewee: reviewForm.reviewee, rating: '5', comment: '' });
    setNotice('Feedback submitted successfully');
    loadReviews();
  };

  return (
    <div className="space-y-6">
      <section className="premium-card rounded-2xl p-6">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-lagoon">Feedback</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">Review your skill exchanges.</h2>
            <p className="mt-3 max-w-2xl text-ink/60">
              Share feedback with accepted connections and see what your matches have said about your sessions.
            </p>
          </div>
          <div className="rounded-2xl bg-ink px-5 py-4 text-white">
            <p className="text-sm text-white/55">Received</p>
            <p className="font-display text-4xl font-extrabold text-mango">{reviews.length}</p>
          </div>
        </div>
      </section>

      {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 font-extrabold text-lagoon">{notice}</p>}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={submitReview} className="panel rounded-2xl p-6">
          <p className="eyebrow text-lagoon">Give feedback</p>
          <h3 className="mt-2 font-display text-3xl font-extrabold">Rate a connection</h3>

          {connectedPeers.length > 0 ? (
            <div className="mt-6 grid gap-4">
              <label>
                <span className="font-bold">Connection</span>
                <select
                  className="field mt-2"
                  value={reviewForm.reviewee}
                  onChange={(event) => setReviewForm({ ...reviewForm, reviewee: event.target.value })}
                  required
                >
                  <option value="">Select a connected learner</option>
                  {connectedPeers.map((peer) => (
                    <option key={peer._id} value={peer._id}>
                      {peer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="font-bold">Rating</span>
                <select
                  className="field mt-2"
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="font-bold">Comment</span>
                <textarea
                  className="field mt-2"
                  rows="5"
                  placeholder="How was the session?"
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                />
              </label>
              <button className="btn-accent">Submit feedback</button>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-ink/10 bg-white p-5 font-bold text-ink/55">
              Accept a connection before leaving feedback.
            </p>
          )}
        </form>

        <section className="panel rounded-2xl p-6">
          <p className="eyebrow text-lagoon">Received feedback</p>
          <h3 className="mt-2 font-display text-3xl font-extrabold">What matches said</h3>
          <div className="mt-6 grid gap-4">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-extrabold">{review.reviewer.name}</p>
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-extrabold text-ink">
                    {review.rating} / 5
                  </p>
                </div>
                <p className="mt-3 text-ink/65">{review.comment || 'No comment added.'}</p>
              </article>
            ))}
            {reviews.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink/10 bg-white p-5 font-bold text-ink/55">
                No feedback received yet. It will appear here when a match reviews you.
              </p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default FeedbackPage;
