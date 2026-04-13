import React, { useState } from 'react';
import {
  Shield, LayoutDashboard, FileText, Skull,
  ShieldCheck, LogOut, ChevronRight, AlertTriangle,
  User, Menu, X
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { usePhase } from '../PhaseContext';

const NAV_ITEMS = [
  {
    section: 'Lab',
    items: [
      { id: 'overview',     label: 'Overview',         icon: <LayoutDashboard size={16} />, badge: null },
      { id: 'documents',    label: 'My Documents',     icon: <FileText size={16} />,        badge: null },
    ],
  },
  {
    section: 'Attack',
    items: [
      { id: 'attack',       label: 'Attacker Console', icon: <Skull size={16} />,           badge: 'vuln' },
    ],
  },
  {
    section: 'Defense',
    items: [
      { id: 'mitigations',  label: 'Mitigations',      icon: <ShieldCheck size={16} />,     badge: 'fix' },
    ],
  },
];

const USER_COLORS = {
  alice:    '#6366f1',
  bob:      '#8b5cf6',
  charlie:  '#06b6d4',
  attacker: '#ef4444',
};

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const { phase, setPhase } = usePhase();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isVulnerable = phase === 'vulnerable';
  const userColor = USER_COLORS[user?.username?.toLowerCase()] ?? 'var(--indigo)';
  const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      {/* Brand */}
      <a className="navbar-brand" href="#" id="nav-brand" onClick={(e) => { e.preventDefault(); onTabChange('overview'); }}>
        <div className="brand-icon">
          <Shield size={18} color="white" />
        </div>
        SecureVault
        <span style={{
          fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase',
          color:'var(--text-muted)', marginLeft:2,
        }}>Lab</span>
      </a>

      {/* Phase indicator */}
      <div className="navbar-center">
        <div
          id="phase-indicator"
          className={`phase-badge ${isVulnerable ? 'vulnerable active' : 'mitigated active'}`}
          onClick={() => setPhase(isVulnerable ? 'mitigated' : 'vulnerable')}
          title="Click to toggle phase"
          style={{ cursor:'pointer' }}
        >
          <span className="phase-dot" />
          {isVulnerable ? 'Vulnerable' : 'Mitigated'}
        </div>
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        {/* User pill */}
        <div className="user-pill" id="user-pill">
          <div className="user-avatar" style={{ background: userColor }}>
            {initials}
          </div>
          <span style={{ color:'var(--text-primary)', fontWeight:600 }}>
            {user?.username ?? 'user'}
          </span>
          {user?.role && (
            <span style={{
              fontSize:'0.68rem', color:'var(--text-muted)',
              background:'var(--bg-secondary)', padding:'2px 6px',
              borderRadius:10, marginLeft:2,
            }}>
              {user.role}
            </span>
          )}
        </div>

        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={14} />
          <span style={{ display:'none' }} className="hide-mobile">Logout</span>
        </button>
      </div>
    </nav>
  );
}

// ── Sidebar component ─────────────────────────────────────────────────────────

export function Sidebar({ activeTab, onTabChange }) {
  const { user } = useAuth();
  const { phase } = usePhase();
  const isVulnerable = phase === 'vulnerable';

  return (
    <aside className="sidebar">
      {NAV_ITEMS.map((section) => (
        <React.Fragment key={section.section}>
          <div className="nav-section-label">{section.section}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              {item.icon}
              {item.label}
              {item.badge === 'vuln' && (
                <span className={`nav-item-badge ${isVulnerable ? 'badge-danger' : 'badge-success'}`}>
                  {isVulnerable ? 'OPEN' : 'FIXED'}
                </span>
              )}
              {item.badge === 'fix' && (
                <span className="nav-item-badge badge-info">Phase 3</span>
              )}
            </button>
          ))}
        </React.Fragment>
      ))}

      <div style={{ flex:1 }} />

      {/* Bottom info box */}
      <div style={{
        background:'var(--warn-bg)', border:'1px solid rgba(245,158,11,0.2)',
        borderRadius:'var(--radius-md)', padding:'12px 14px', marginTop:8,
      }}>
        <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--warn-light)', marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>
          <AlertTriangle size={12} /> Lab Environment
        </div>
        <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', lineHeight:1.5 }}>
          Intentionally vulnerable for educational purposes. All credentials are demo data.
        </p>
      </div>
    </aside>
  );
}
