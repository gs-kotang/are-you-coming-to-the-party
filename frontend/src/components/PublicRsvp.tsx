import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicInvite, submitRsvp } from '../api/client';
import { PublicInvite } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function PublicRsvp() {
  const { id } = useParams<{ id: string }>();
  const [invite, setInvite] = useState<PublicInvite | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvite(id);
    }
  }, [id]);

  const loadInvite = async (inviteId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicInvite(inviteId);
      setInvite(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invite not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await submitRsvp(id, name.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-page">
        <div className="loading">Loading invite...</div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="public-page">
        <div className="public-card">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  return (
    <div className="public-page">
      <div className="public-card">
        <div className="invite-full-frame">
          <img src={invite.imageUrl} alt="Party invite" className="invite-full-image" />
        </div>

        {invite.isExpired ? (
          <>
            <h1>RSVPs are closed</h1>
            <p style={{ color: '#65676b' }}>
              The deadline was {formatDate(invite.expiresAt)}.
            </p>
          </>
        ) : submitted ? (
          <>
            <h1>You&apos;re on the list!</h1>
            <p style={{ color: '#65676b' }}>
              Thanks, {name.trim()} — see you at the party.
            </p>
          </>
        ) : (
          <>
            <p className="question">Are you coming?</p>
            <p style={{ color: '#65676b', marginBottom: '1rem' }}>
              RSVP by {formatDate(invite.expiresAt)}
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />

              {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

              <button type="submit" className="primary-button" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Saving...' : 'Yes!'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
