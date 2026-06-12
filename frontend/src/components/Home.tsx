import { Link } from 'react-router-dom';
import { PastInviteList } from './PastInviteList';

export function Home() {
  return (
    <div className="home">
      <div className="home-actions">
        <Link to="/create" className="home-create-button">
          Create new invite
        </Link>
      </div>
      <PastInviteList />
    </div>
  );
}
