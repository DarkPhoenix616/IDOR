import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../AuthContext';

// Demo accounts — real credentials from the backend
const DEMO_USERS = [
  {
    label:    'Danie (You)',
    email:    'daniegeorgejohn@gmail.com',
    password: 'Danie@2004',
    role:     'Victim (Owner)',
    color:    '#6366f1',
    initials: 'DG',
  },
  {
    label:    'Alice',
    email:    'alice@idor.com',
    password: 'Alice@2024',
    role:     'Victim',
    color:    '#8b5cf6',
    initials: 'AL',
  },
  {
    label:    'Bob',
    email:    'bob@idor.com',
    password: 'Bob@2024',
    role:     'Victim',
    color:    '#06b6d4',
    initials: 'BO',
  },
  {
    label:    'Attacker',
    email:    'attacker@idor.com',
    password: 'Attack@2026',
    role:     '⚠ Attacker',
    color:    '#ef4444',
    initials: 'AT',
  },
];

export default function LoginPage() {
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);

  const prefill = (u) => {
    setSelected(u.email);
    setEmail(u.email);
    setPassword(u.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      const msg = err?.response?.data?.message
               ?? err?.response?.data?.error
               ?? err?.message
               ?? 'Login failed. Check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />

      <div className="login-box">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Shield size={30} color="white" />
          </div>
          <h1>SecureVault</h1>
          <p>IDOR Vulnerability Proof of Concept Lab</p>
        </div>

        <div className="login-card">
          <h2>Sign in to your account</h2>
          <p className="subtitle">
            Select a demo user below or enter credentials manually
          </p>

          {/* Quick-select demo users */}
          <div className="user-select-grid">
            {DEMO_USERS.map((u) => (
              <div
                key={u.email}
                id={`demo-user-${u.label.replace(/\s+/g,'').toLowerCase()}`}
                className={`user-select-card ${selected === u.email ? 'selected' : ''}`}
                onClick={() => prefill(u)}
              >
                <div className="uc-avatar" style={{ background: u.color }}>
                  {u.initials}
                </div>
                <div className="uc-name">{u.label}</div>
                <div className="uc-role">{u.role}</div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner" id="login-error">
              <Lock size={14} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email</label>
              <input
                id="email-input"
                className="form-input"
                type="email"
                placeholder="user@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSelected(null); }}
                required
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="password-input">Password</label>
              <input
                id="password-input"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 42 }}
                required
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 12, top: 34,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 0,
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full btn-lg"
              style={{ justifyContent: 'center', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spin" style={{ display:'inline-block' }}>⟳</span> Authenticating…</>
              ) : (
                <><Zap size={16} /> Sign In</>
              )}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--warn-light)', lineHeight: 1.6 }}>
              <strong>⚠ Lab Notice:</strong> This application intentionally contains security vulnerabilities
              for educational demonstration purposes. Do not use real credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
