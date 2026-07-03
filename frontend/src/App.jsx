import { useState } from 'react';
import LoginPage from './LoginPage.jsx';
import SignupPage from './SignupPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'signup'

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4EC] text-[#0F1830]">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold">Signed in as {user.fullName}</h1>
          <p className="mt-2 text-[#5B6478]">
            Role: {user.role} · {user.email}
          </p>
          <button
            onClick={() => setUser(null)}
            className="mt-6 rounded-full bg-[#0F1830] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <SignupPage
        onAuthenticated={(u) => setUser(u)}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <LoginPage
      onAuthenticated={(u) => setUser(u)}
      onSwitchToSignup={() => setView('signup')}
    />
  );
}
