import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchInvites } from '../api/client';
import { InviteSummary } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function PastInvites() {
  const [invites, setInvites] = useState<InviteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvites();
      setInvites(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invites.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/" className="back-button">
        ← Back
      </Link>

      <div style={{ marginTop: '1rem' }}>
        <h2>Past invites</h2>

        {loading && <div className="loading">Loading invites...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && invites.length === 0 && (
          <div className="empty-state">
            <p>No invites yet. Create your first one!</p>
            <Link to="/create" className="primary-button" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
              Create new invite
            </Link>
          </div>
        )}

        {!loading && !error && invites.length > 0 && (
          <div className="invite-grid" style={{ marginTop: '1rem' }}>
            {invites.map((invite) => (
              <Link key={invite.id} to={`/invites/${invite.id}`} className="invite-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={invite.imageUrl} alt="Invite" className="invite-thumb" />
                <div className="invite-meta">
                  <h3>Invite</h3>
                  <p>Created {formatDate(invite.createdAt)}</p>
                  <p>RSVP by {formatDate(invite.expiresAt)}</p>
                  <span className={`badge ${invite.isExpired ? 'badge-expired' : 'badge-open'}`}>
                    {invite.isExpired ? 'Closed' : 'Open'}
                  </span>
                </div>
                <div className="rsvp-count">
                  {invite.rsvpCount}
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#65676b' }}>coming</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
