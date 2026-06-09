import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="home-actions">
      <Link to="/create" className="primary-button" style={{ textDecoration: 'none', textAlign: 'center' }}>
        Create new invite
      </Link>
      <Link to="/invites" className="secondary-button" style={{ textDecoration: 'none', textAlign: 'center' }}>
        View past invites
      </Link>
    </div>
  );
}
