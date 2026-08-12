import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

const sha256 = async (message: string) => {
  const msgBuff = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuff);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const generateToken = async () => {
  const rand = crypto.getRandomValues(new Uint8Array(32));
  const now = String(Date.now());
  const base = Array.from(rand).join(',') + now;
  return sha256(base);
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('GS');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ADMIN_USERNAME = 'GS';
  const ADMIN_PLAIN = 'GS92076';

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    // Short delay for loading animation
    setTimeout(async () => {
      if (username === ADMIN_USERNAME && password === ADMIN_PLAIN) {
        const pwdHash = await sha256(password);
        const token = await generateToken();
        const session = {
          token,
          username,
          passwordHash: pwdHash,
          expiry: Date.now() + 60 * 60 * 1000, // 1 hour max session
          maxSessions: 1,
        } as const;

        localStorage.setItem('kairoos_session', JSON.stringify(session));
        setLoading(false);
        onLogin();
      } else {
        setLoading(false);
        setError('Invalid credentials.');
      }
    }, 700);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, rgba(2,6,23,0.9), rgba(2,6,23,0.96))',
      zIndex: 9999,
    }}>
      <style>{`
        .kp-card{background:linear-gradient(180deg,#071033,#04122a);padding:28px;border-radius:14px;box-shadow:0 12px 40px rgba(2,6,23,0.7);width:420px;color:#e6eef8}
        .kp-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#e6eef8;margin-top:8px}
        .kp-btn{margin-top:14px;width:100%;padding:10px 12px;border-radius:10px;border:none;background:#1e40af;color:white;font-weight:700;cursor:pointer}
        .kp-error{color:#ffb4b4;margin-top:8px;font-weight:700}
        .kp-loader{display:flex;align-items:center;gap:12px}
        .kp-spinner{width:36px;height:36px;border-radius:50%;border:4px solid rgba(255,255,255,0.08);border-top-color:#60a5fa;animation:kp-spin 1s linear infinite}
        @keyframes kp-spin{to{transform:rotate(360deg)}}
        .kairos-text{font-weight:900;color:#bfdbfe;letter-spacing:2px}
        .dots::after{content:' ...';animation:kp-dots 1s steps(4,end) infinite}
        @keyframes kp-dots{0%,20%{content:''}40%{content:'.'}60%{content:'..'}100%{content:'...'}}
      `}</style>

      <form className="kp-card" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>K</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#e6eef8' }}>Welcome back</div>
            <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 800 }}>Sign in to continue to Kairos</div>
          </div>
        </div>

        <label style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 800 }}>Username</label>
        <input className="kp-input" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 800, marginTop: 10 }}>Password</label>
        <input className="kp-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="kp-error">{error}</div>}

        <button type="submit" className="kp-btn" disabled={loading}>
          {loading ? (
            <div className="kp-loader">
              <div className="kp-spinner" />
              <div>
                <div className="kairos-text">KAIROS<span className="dots" /></div>
                <div style={{ fontSize: 12, color: '#cfe1ff', fontWeight: 700 }}>Signing in...</div>
              </div>
            </div>
          ) : (
            'Sign in'
          )}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
          Admin username: <strong style={{ color: '#e6eef8' }}>{ADMIN_USERNAME}</strong>
          <div style={{ marginTop: 6 }}>Password is hidden; the stored password hash is saved when you sign in for audit.</div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
