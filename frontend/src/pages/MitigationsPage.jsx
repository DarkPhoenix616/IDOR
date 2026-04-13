import React from 'react';
import {
  ShieldCheck, AlertTriangle, Code2, Database,
  ArrowRight, CheckCircle, XCircle, Lock
} from 'lucide-react';
import { usePhase } from '../PhaseContext';

const VULN_CODE = `// ❌ Vulnerable Spring Boot controller
@GetMapping("/api/documents/{id}")
public ResponseEntity<?> getDocument(
    @PathVariable Long id,
    @AuthenticationPrincipal UserDetails user) {

  // Bug: fetches by ID with ZERO ownership check
  Document doc = documentRepository.findById(id)
    .orElseThrow(() -> new NotFoundException());

  return ResponseEntity.ok(doc); // returned to ANY authenticated user
}`;

const FIXED_AUTH_CODE = `// ✅ Phase 3 Fix — Authorization Matrix
@GetMapping("/api/documents/{id}")
public ResponseEntity<?> getDocument(
    @PathVariable Long id,
    @AuthenticationPrincipal UserDetails userDetails) {

  User currentUser = userRepository
    .findByUsername(userDetails.getUsername())
    .orElseThrow();

  Document doc = documentRepository.findById(id)
    .orElseThrow(() -> new NotFoundException());

  // ✅ Ownership check — reject if not the owner
  if (!doc.getOwner().getId().equals(currentUser.getId())) {
    throw new AccessDeniedException("403 Forbidden");
  }

  return ResponseEntity.ok(doc);
}`;

const FIXED_UUID_CODE = `// ✅ Phase 3 Fix — UUID primary keys (schema migration)
@Entity
public class Document {

  // Before: sequential integer — easily enumerable
  // @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  // private Long id;

  // After: UUID — cryptographically random, non-guessable
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "uuid", updatable = false)
  private UUID id;

  // Attacker can no longer enumerate by incrementing integer IDs
  // Even without auth middleware, the namespace is 2^122 ≈ 5 × 10^36
}`;

function DiffLine({ type, text }) {
  const cls = type === '+' ? 'line-add' : type === '-' ? 'line-del' : 'line-ctx';
  const prefix = type === '+' ? '+ ' : type === '-' ? '- ' : '  ';
  return <span className={cls}>{prefix}{text}</span>;
}

function VulnCodeBlock({ code, title, type }) {
  const colorMap = { danger:'var(--danger-light)', success:'var(--success-light)', info:'var(--cyan-light)' };
  return (
    <div style={{ marginBottom:0 }}>
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        fontSize:'0.78rem', fontWeight:700,
        color: colorMap[type] ?? 'var(--text-secondary)',
        marginBottom:8,
      }}>
        {type === 'danger'  && <XCircle size={14} />}
        {type === 'success' && <CheckCircle size={14} />}
        {title}
      </div>
      <pre className="code-diff" style={{ maxHeight:320, overflow:'auto' }}>
        <code style={{ fontFamily:'var(--font-mono)', fontSize:'0.74rem', whiteSpace:'pre' }}>{code}</code>
      </pre>
    </div>
  );
}

const MITIGATION_STEPS = [
  {
    num: '01',
    title: 'Code-Level Authorization Check',
    icon: <Lock size={20} />,
    color: 'var(--success)',
    bg:    'var(--success-bg)',
    border:'rgba(16,185,129,0.3)',
    desc: 'Add an ownership assertion to every sensitive endpoint. The server must always verify that the requesting user owns the requested resource — never trust the client-supplied ID alone.',
    impact: 'All unauthorized requests now receive 403 Forbidden.',
    code: FIXED_AUTH_CODE,
    codeType: 'success',
  },
  {
    num: '02',
    title: 'Non-Sequential UUIDs as Primary Keys',
    icon: <Database size={20} />,
    color: 'var(--cyan)',
    bg:    'var(--cyan-bg)',
    border:'rgba(6,182,212,0.3)',
    desc: 'Migrate database primary keys from auto-incrementing integers to UUIDs. This makes IDs impossible to enumerate even if the authorization check were bypassed.',
    impact: '2^122 possible IDs — brute-forcing is computationally infeasible.',
    code: FIXED_UUID_CODE,
    codeType: 'success',
  },
];

export default function MitigationsPage() {
  const { phase, setPhase } = usePhase();

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <ShieldCheck size={22} style={{ display:'inline', marginRight:8, color:'var(--success-light)', verticalAlign:'middle' }} />
            Mitigation & Defense
          </h2>
          <p className="page-subtitle">
            Phase 3 — code-level and architectural patches
          </p>
        </div>
        <div className="phase-toggle">
          <button
            id="toggle-vulnerable"
            className={`phase-toggle-btn ${phase === 'vulnerable' ? 'active-vuln' : ''}`}
            onClick={() => setPhase('vulnerable')}
          >
            ⚠ Vulnerable
          </button>
          <button
            id="toggle-mitigated"
            className={`phase-toggle-btn ${phase === 'mitigated' ? 'active-safe' : ''}`}
            onClick={() => setPhase('mitigated')}
          >
            ✓ Mitigated
          </button>
        </div>
      </div>

      {/* Root cause */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><AlertTriangle size={15} color="var(--warn-light)" /> Root Cause Analysis</span>
        </div>
        <p style={{ fontSize:'0.86rem', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:16 }}>
          IDOR (Insecure Direct Object Reference) occurs when an application uses user-supplied input
          to access objects directly without verifying that the requesting user has the right to do so.
          The three required conditions are:
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
          {[
            { icon:'🔑', title:'Valid Auth Token',        desc:'Attacker only needs a low-privilege account — a legitimate JWT grants API access.' },
            { icon:'🔢', title:'Predictable IDs',         desc:'Sequential auto-increment integers make enumeration trivial (101, 102, 103…).' },
            { icon:'⚠',  title:'Missing Authz Check',     desc:'Backend trusts the client ID. No server-side ownership verification exists.' },
          ].map((item) => (
            <div key={item.title} style={{
              background:'var(--bg-secondary)', border:'1px solid var(--border-subtle)',
              borderRadius:'var(--radius-md)', padding:'14px 16px',
            }}>
              <div style={{ fontSize:'1.4rem', marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>{item.title}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerable code */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Code2 size={15} color="var(--danger-light)" /> Vulnerable Code</span>
          <span className="tag tag-vuln">Before Fix</span>
        </div>
        <VulnCodeBlock code={VULN_CODE} title="Vulnerable endpoint — zero authorization" type="danger" />
        <div className="alert-banner danger" style={{ marginTop:14 }}>
          <AlertTriangle size={14} className="alert-icon" />
          Any authenticated user hitting <code style={{ fontFamily:'var(--font-mono)' }}>/api/documents/105</code> gets the
          full document regardless of ownership. The backend only checks authentication (JWT valid?),
          never authorization (is this your document?).
        </div>
      </div>

      {/* Mitigation cards */}
      {MITIGATION_STEPS.map((step, i) => (
        <div key={i} className="card" style={{ borderColor: step.border }}>
          <div className="card-header">
            <span className="card-title" style={{ color: step.color }}>
              <span style={{
                background: step.bg, border: `1px solid ${step.border}`,
                borderRadius: 'var(--radius-sm)', padding:'2px 7px',
                fontFamily:'var(--font-mono)', fontSize:'0.72rem', marginRight:6,
              }}>
                FIX {step.num}
              </span>
              {step.icon} {step.title}
            </span>
            <span className="tag tag-safe">Applied in Phase 3</span>
          </div>

          <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:16 }}>
            {step.desc}
          </p>

          <div style={{ marginBottom:14 }}>
            <VulnCodeBlock code={step.code} title={step.title} type={step.codeType} />
          </div>

          <div className="alert-banner success">
            <CheckCircle size={14} className="alert-icon" />
            <div><strong>Impact:</strong> {step.impact}</div>
          </div>
        </div>
      ))}

      {/* Before/after comparison */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Before vs After — Attack Outcome</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--danger-light)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <XCircle size={13} /> Vulnerable (Phase 2)
            </div>
            <pre className="code-diff" style={{ fontSize:'0.73rem' }}>
              <span className="line-ctx">GET /api/documents/105</span>
              <span className="line-ctx">Authorization: Bearer &lt;attacker_jwt&gt;</span>
              <span className="line-ctx"></span>
              <span className="line-add">HTTP/1.1 200 OK</span>
              <span className="line-add">{'{'}</span>
              <span className="line-add">  "id": 105,</span>
              <span className="line-add">  "title": "Q4 Financial Report",</span>
              <span className="line-add">  "owner": "alice",</span>
              <span className="line-add">  "classification": "CONFIDENTIAL",</span>
              <span className="line-add">  "content": "Revenue: $4.2M..."</span>
              <span className="line-add">{'}'}</span>
            </pre>
          </div>
          <div>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--success-light)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <CheckCircle size={13} /> Mitigated (Phase 3)
            </div>
            <pre className="code-diff" style={{ fontSize:'0.73rem' }}>
              <span className="line-ctx">GET /api/documents/105</span>
              <span className="line-ctx">Authorization: Bearer &lt;attacker_jwt&gt;</span>
              <span className="line-ctx"></span>
              <span className="line-del">HTTP/1.1 403 Forbidden</span>
              <span className="line-del">{'{'}</span>
              <span className="line-del">  "error": "Access Denied",</span>
              <span className="line-del">  "message": "You do not own this resource."</span>
              <span className="line-del">{'}'}</span>
            </pre>
          </div>
        </div>
      </div>

      {/* Phase toggle CTA */}
      <div className="alert-banner info">
        <ArrowRight size={16} className="alert-icon" />
        <div>
          Switch the app to <strong>Mitigated Mode</strong> using the toggle above, then head to the{' '}
          <strong>Attacker Console</strong> to re-run the enumeration and observe 403 Forbidden responses.
        </div>
      </div>
    </div>
  );
}
