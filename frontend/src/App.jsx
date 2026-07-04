import { useState, useEffect } from 'react';
import LoginPage from './LoginPage.jsx';
import SignupPage from './SignupPage.jsx';
import Dashboard from './Dashboard.jsx';

const API_BASE = import.meta?.env?.VITE_API_URL || 'https://everystage-backend.onrender.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'signup'
  const [oauthChecking, setOauthChecking] = useState(true);
  const [oauthError, setOauthError] = useState('');

  // On first load, check whether we just got redirected back from Google/LinkedIn
  // with a token attached to the URL (?oauth_token=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('oauth_token');
    const error = params.get('oauth_error');

    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setAccessToken(token);
          }
        })
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname); // clean the token out of the URL
          setOauthChecking(false);
        });
    } else if (error) {
      setOauthError('That sign-in attempt didn\'t go through. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
      setOauthChecking(false);
    } else {
      setOauthChecking(false);
    }
  }, []);

  if (oauthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4EC] text-[#0F1830]">
        <p className="font-mono text-sm text-[#5B6478]">Signing you in...</p>
      </div>
    );
  }

  if (user) {
    return (
      <Dashboard
        user={user}
        token={accessToken}
        onSignOut={() => {
          setUser(null);
          setAccessToken(null);
        }}
      />
    );
  }

  if (view === 'signup') {
    return (
      <SignupPage
        onAuthenticated={(u, t) => {
          setUser(u);
          setAccessToken(t);
        }}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <>
      {oauthError && (
        <div className="bg-[#C4443A] px-4 py-2 text-center text-sm text-white">{oauthError}</div>
      )}
      <LoginPage
        onAuthenticated={(u, t) => {
          setUser(u);
          setAccessToken(t);
        }}
        onSwitchToSignup={() => setView('signup')}
      />
    </>
  );
}
