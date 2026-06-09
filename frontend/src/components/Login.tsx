import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export function Login() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1>Are You Coming to the Party?</h1>
        <p>Upload an invite, share a link, and see who&apos;s coming.</p>
      </div>
      <div className="login-card-wrapper">
        <div className="login-card">
          <h2>Sign In</h2>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="google-sign-in-button"
          >
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
          <p className="login-note">Sign in to create and manage your invites</p>
        </div>
      </div>
    </div>
  );
}
