import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchInvite, getShareUrl } from '../api/client';
import { InviteDetail } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function InviteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvite(id);
    }
  }, [id]);

  const loadInvite = async (inviteId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvite(inviteId);
      setInvite(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invite.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(getShareUrl(invite.shareUrl));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyNames = async () => {
    if (!invite) return;
    const names = invite.rsvps.map((rsvp) => rsvp.name).join(', ');
    await navigator.clipboard.writeText(names);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="loading">Loading invite...</div>;
  }

  if (error || !invite) {
    return <div className="error-message">{error || 'Invite not found'}</div>;
  }

  return (
    <div>
      <div className="detail-header">
        <Link to="/invites" className="back-button">
          ← Back to invites
        </Link>
        <button type="button" className="copy-button" onClick={handleCopyLink}>
          {copied ? 'Copied!' : 'Copy share link'}
        </button>
      </div>

      <div className="detail-layout">
        <div>
          <img src={invite.imageUrl} alt="Invite" className="detail-image" />
          <div className="stats-row">
            <div className="stat-card">
              <strong>{invite.rsvpCount}</strong>
              coming
            </div>
            <div className="stat-card">
              <strong>{invite.isExpired ? 'Closed' : 'Open'}</strong>
              RSVP status
            </div>
          </div>
          <p style={{ color: '#65676b' }}>
            RSVP deadline: {formatDate(invite.expiresAt)}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Who&apos;s coming</h2>
            {invite.rsvps.length > 0 && (
              <button type="button" className="secondary-button" onClick={handleCopyNames} style={{ minWidth: 'auto', padding: '0.5rem 0.75rem' }}>
                Copy names
              </button>
            )}
          </div>

          {invite.rsvps.length === 0 ? (
            <p className="empty-state" style={{ padding: '2rem 0' }}>
              No RSVPs yet. Share the link with your guests!
            </p>
          ) : (
            <ul className="rsvp-list">
              {invite.rsvps.map((rsvp) => (
                <li key={rsvp.id}>
                  <span className="rsvp-name">{rsvp.name}</span>
                  <span className="rsvp-time">{formatDate(rsvp.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
