import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { CreateInvite } from './components/CreateInvite';
import { InviteDetailPage } from './components/InviteDetail';
import { PublicRsvp } from './components/PublicRsvp';
import './App.css';

function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div>
          <h1>Are You Coming to the Party?</h1>
          <p>Create invites and track RSVPs</p>
        </div>
        {user && (
          <div className="user-info">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar" />
            )}
            <div>
              <span className="user-name">{user.displayName || user.email}</span>
              <button onClick={logout} className="logout-button">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">{children}</main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/invite/:id" element={<PublicRsvp />} />

      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/"
        element={
          <ProtectedLayout>
            <Home />
          </ProtectedLayout>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedLayout>
            <CreateInvite />
          </ProtectedLayout>
        }
      />
      <Route path="/invites" element={<Navigate to="/" replace />} />
      <Route
        path="/invites/:id"
        element={
          <ProtectedLayout>
            <InviteDetailPage />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
