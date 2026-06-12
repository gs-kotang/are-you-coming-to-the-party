import { Link } from 'react-router-dom';
import { InviteSummary } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function InviteCard({ invite }: { invite: InviteSummary }) {
  return (
    <Link
      to={`/invites/${invite.id}`}
      className="invite-card"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <img src={invite.imageUrl} alt="Invite" className="invite-thumb" />
      <div className="invite-meta">
        <h3>Invite</h3>
        <p>Created {formatDate(invite.createdAt)}</p>
        <p>Event {formatDate(invite.eventAt)}</p>
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
  );
}
