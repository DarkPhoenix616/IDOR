import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Users, Activity,
  TrendingUp, Shield, AlertTriangle, Clock, RefreshCw
} from 'lucide-react';
import { getMyDocuments } from '../api';
import { useAuth } from '../AuthContext';
import { usePhase } from '../PhaseContext';

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {React.cloneElement(icon, { size: 20, color })}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

const TIMELINE = [
  { phase:'Phase 1', title:'Setup & Vulnerable Implementation', status:'done',    color:'var(--success)',      desc:'Infrastructure deployed. Vulnerable endpoints exposed.' },
  { phase:'Phase 2', title:'Attack Execution & Demonstration',  status:'active',  color:'var(--danger)',       desc:'Attacker script enumerates all document IDs.' },
  { phase:'Phase 3', title:'Defense & Mitigation',              status:'pending', color:'var(--indigo-light)', desc:'Authorization matrix + UUID migration applied.' },
];

export default function OverviewPage() {
  const { user }       = useAuth();
  const { phase }      = usePhase();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDocuments()
      .then((d) => setDocs(Array.isArray(d) ? d : (d.documents ?? d.content ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isVulnerable = phase === 'vulnerable';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <div>
          <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:6 }}>
            Welcome back, <span style={{ color:'var(--indigo-light)' }}>{user?.username ?? 'user'}</span> 👋
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.86rem', lineHeight:1.6 }}>
            This is the <strong>IDOR Vulnerability Lab</strong>. Navigate through the phases to experience
            the attack lifecycle — from vulnerability to mitigation.
          </p>
        </div>
        <div style={{ flexShrink:0 }}>
          <div className={`phase-badge ${isVulnerable ? 'vulnerable active' : 'mitigated active'}`} style={{ fontSize:'0.8rem', padding:'6px 14px' }}>
            <span className="phase-dot" />
            {isVulnerable ? 'VULNERABLE MODE' : 'MITIGATED MODE'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <StatCard
          icon={<FileText />}
          label="Your Documents"
          value={loading ? '…' : docs.length}
          color="var(--indigo-light)"
          bg="rgba(99,102,241,0.12)"
        />
        <StatCard
          icon={<AlertTriangle />}
          label="Vulnerability Status"
          value={isVulnerable ? 'OPEN' : 'PATCHED'}
          color={isVulnerable ? 'var(--danger-light)' : 'var(--success-light)'}
          bg={isVulnerable ? 'var(--danger-bg)' : 'var(--success-bg)'}
        />
        <StatCard
          icon={<Shield />}
          label="Auth Method"
          value="JWT"
          color="var(--cyan-light)"
          bg="var(--cyan-bg)"
        />
        <StatCard
          icon={<Users />}
          label="Demo Users"
          value="4"
          color="var(--warn-light)"
          bg="var(--warn-bg)"
        />
      </div>

      {/* Phase timeline */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Activity size={15} /> Project Timeline</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {TIMELINE.map((item, i) => (
            <div key={i} style={{ display:'flex', gap:16, paddingBottom: i < TIMELINE.length-1 ? 20 : 0 }}>
              {/* connector */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%',
                  background: item.status === 'done'   ? 'var(--success-bg)' :
                               item.status === 'active' ? 'var(--danger-bg)'  : 'var(--bg-elevated)',
                  border: `2px solid ${item.color}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', fontWeight:700, color: item.color,
                  flexShrink:0,
                }}>
                  {item.status === 'done' ? '✓' : item.status === 'active' ? '⚡' : '○'}
                </div>
                {i < TIMELINE.length-1 && (
                  <div style={{ width:2, flex:1, background:'var(--border-subtle)', marginTop:6 }} />
                )}
              </div>
              <div style={{ paddingTop:6 }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color: item.color, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>
                  {item.phase}
                </div>
                <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.5 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IDOR explanation */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
        <div className="card" style={{ borderColor:'rgba(239,68,68,0.2)' }}>
          <div className="card-header">
            <span className="card-title" style={{ color:'var(--danger-light)' }}><AlertTriangle size={15} /> What is IDOR?</span>
          </div>
          <p style={{ fontSize:'0.83rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
            <strong style={{ color:'var(--text-primary)' }}>Insecure Direct Object Reference (IDOR)</strong> is an OWASP Top 10
            vulnerability (A01 — Broken Access Control) that occurs when an application exposes
            internal implementation objects (IDs, filenames, keys) and fails to verify whether
            the requestor has permission to access the referenced object.
          </p>
        </div>
        <div className="card" style={{ borderColor:'rgba(16,185,129,0.2)' }}>
          <div className="card-header">
            <span className="card-title" style={{ color:'var(--success-light)' }}><Shield size={15} /> Quick Navigation</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'📄 View your documents',    note:'Authenticated user perspective' },
              { label:'💀 Run the attack script',  note:'Attacker brute-force simulation' },
              { label:'🛡 Apply mitigations',       note:'Code & architecture fixes' },
            ].map((item, i) => (
              <div key={i} style={{
                background:'var(--bg-secondary)', border:'1px solid var(--border-subtle)',
                borderRadius:'var(--radius-md)', padding:'10px 14px',
              }}>
                <div style={{ fontSize:'0.84rem', fontWeight:600, color:'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize:'0.74rem', color:'var(--text-muted)', marginTop:2 }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
