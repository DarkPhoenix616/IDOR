import React, { useState, useRef, useCallback } from 'react';
import {
  Terminal, Play, Square, AlertTriangle, CheckCircle,
  Shield, Skull, ChevronRight, Settings, Zap, Download
} from 'lucide-react';
import { bruteForceDocuments, login as apiLogin } from '../api';
import { usePhase } from '../PhaseContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false });

const ATK_CREDS = { email: 'attacker@idor.com', password: 'Attack@2026' };

function StatsBox({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '10px 16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function LogLine({ entry }) {
  const cls = {
    info:      'log-info',
    ok:        'log-ok',
    hit:       'log-hit',
    miss:      'log-dim',
    error:     'log-err',
    warn:      'log-warn',
    forbidden: 'log-warn',
    json:      'log-json',
    dim:       'log-dim',
  }[entry.type] ?? 'log-dim';

  return (
    <div className="log-line">
      <span className="log-time">[{entry.time}]</span>
      <span className={cls}>{entry.msg}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AttackPage() {
  const { phase } = usePhase();
  const isVulnerable = phase === 'vulnerable';

  const [running,    setRunning]    = useState(false);
  const [logs,       setLogs]       = useState([]);
  const [stats,      setStats]      = useState({ total: 0, hits: 0, misses: 0, forbidden: 0 });
  const [progress,   setProgress]   = useState(0);
  const [stolenDocs, setStolenDocs] = useState([]);

  // Config
  const [startId,  setStartId]  = useState(1);
  const [endId,    setEndId]    = useState(20);
  const [delayMs,  setDelayMs]  = useState(300);

  const stopRef    = useRef(false);
  const consoleRef = useRef(null);

  const addLog = useCallback((type, msg) => {
    setLogs((prev) => {
      const next = [...prev, { type, msg, time: ts() }];
      return next.slice(-500); // cap at 500 lines
    });
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 30);
  }, []);

  const reset = () => {
    setLogs([]);
    setStats({ total: 0, hits: 0, misses: 0, forbidden: 0 });
    setProgress(0);
    setStolenDocs([]);
    stopRef.current = false;
  };

  const runAttack = async () => {
    reset();
    setRunning(true);
    stopRef.current = false;

    addLog('info', '════════════════════════════════════════════');
    addLog('info', `  IDOR Brute-Force Attack Simulation — ${isVulnerable ? 'VULNERABLE MODE' : 'MITIGATED MODE'}`);
    addLog('info', '════════════════════════════════════════════');
    addLog('dim',  `Target  : http://localhost:8080`);
    addLog('dim',  `Endpoint: GET /api/documents/{id}`);
    addLog('dim',  `Range   : ${startId} → ${endId}  |  Delay: ${delayMs}ms`);
    addLog('info', '');

    // Step 1: Authenticate as attacker
    addLog('warn', `[STEP 1] Authenticating as "${ATK_CREDS.email}"…`);
    let attackerToken;
    try {
      const res = await apiLogin(ATK_CREDS.email, ATK_CREDS.password);
      attackerToken = res.token ?? res.jwt ?? res.accessToken ?? res.jwtToken;
      if (!attackerToken) throw new Error('No token returned');
      addLog('ok',   `✓ JWT acquired — ${attackerToken.substring(0, 32)}…`);
    } catch (e) {
      addLog('error', `✗ Auth failed: ${e.message}`);
      setRunning(false);
      return;
    }

    addLog('info', '');
    addLog('warn', `[STEP 2] Enumerating document IDs ${startId}–${endId}…`);
    addLog('info', '');

    const total = endId - startId + 1;
    let hits = 0, misses = 0, forbidden = 0;
    const stolen = [];

    const gen = bruteForceDocuments(attackerToken, Number(startId), Number(endId), Number(delayMs), isVulnerable);

    for await (const result of gen) {
      if (stopRef.current) {
        addLog('warn', '⚠ Attack aborted by user.');
        break;
      }

      const done = result.id - startId + 1;
      setProgress(Math.round((done / total) * 100));

      if (result.status === 'hit') {
        hits++;
        const doc = result.data;
        const ownerName = doc.owner?.firstName ? doc.owner.firstName : doc.owner?.email ? doc.owner.email : "?";
        const title = doc.title ?? doc.name ?? `Document #${result.id}`;
        addLog('hit', `  [${result.id}] ✓ 200 OK — "${title}" (owner: ${ownerName})  ${result.elapsed}ms`);
        stolen.push({ ...doc, _id: result.id });
        setStolenDocs([...stolen]);
      } else if (result.status === 'forbidden') {
        forbidden++;
        addLog('warn', `  [${result.id}] ✗ 403 Forbidden — Access denied  ${result.elapsed}ms`);
      } else if (result.status === 'miss') {
        misses++;
        addLog('dim',  `  [${result.id}]   404 Not Found  ${result.elapsed}ms`);
      } else {
        misses++;
        addLog('error', `  [${result.id}] ! Error (status ${result.status})  ${result.elapsed}ms`);
      }

      setStats({ total: done, hits, misses, forbidden });
    }

    addLog('info', '');
    addLog('info', '════════════════════════════════════════════');
    if (isVulnerable) {
      addLog('ok',  `✓ Attack complete. ${hits}/${total} documents exfiltrated.`);
      if (hits > 0) addLog('hit', `  ★ IDOR vulnerability confirmed — unauthorized data exposed!`);
    } else {
      addLog('ok',   `✓ Attack complete. ${hits} hits, ${forbidden} blocked, ${misses} 404s.`);
      addLog('info', `  Mitigation effective — ${forbidden} requests returned 403 Forbidden.`);
    }
    addLog('info', '════════════════════════════════════════════');

    setRunning(false);
  };

  const stopAttack = () => { stopRef.current = true; };

  const exportLoot = () => {
    const text = JSON.stringify(stolenDocs, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'stolen_documents.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Skull size={22} style={{ display:'inline', marginRight:8, color:'var(--danger-light)', verticalAlign:'middle' }} />
            Attacker Console
          </h2>
          <p className="page-subtitle">
            Automated IDOR enumeration — simulates a real attacker script
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`tag ${isVulnerable ? 'tag-vuln' : 'tag-safe'}`}>
            {isVulnerable ? '⚠ Vulnerable Mode' : '✓ Mitigated Mode'}
          </span>
        </div>
      </div>

      {/* Info banner */}
      {isVulnerable ? (
        <div className="alert-banner danger">
          <AlertTriangle size={16} className="alert-icon" />
          <div>
            <strong>Phase 2 — Attack Execution:</strong> The attacker authenticates with their own valid JWT,
            then systematically sends requests to <code style={{ fontFamily:'var(--font-mono)' }}>GET /api/documents/&#123;id&#125;</code> with
            incrementing IDs. The backend does <strong>no ownership check</strong>, so every document is returned.
          </div>
        </div>
      ) : (
        <div className="alert-banner success">
          <CheckCircle size={16} className="alert-icon" />
          <div>
            <strong>Phase 3 — Mitigated:</strong> The backend now verifies <code style={{ fontFamily:'var(--font-mono)' }}>currentUser.id == document.ownerId</code>.
            Requests for foreign documents return <strong>403 Forbidden</strong>. UUIDs also prevent guessing.
          </div>
        </div>
      )}

      {/* Config + Stats row */}
      <div className="attack-config">
        {/* Config card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Settings size={15} /> Attack Configuration</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label" htmlFor="start-id-input">Start Document ID</label>
              <input
                id="start-id-input"
                className="form-input"
                type="number"
                min={1}
                value={startId}
                onChange={(e) => setStartId(Number(e.target.value))}
                disabled={running}
              />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label" htmlFor="end-id-input">End Document ID</label>
              <input
                id="end-id-input"
                className="form-input"
                type="number"
                min={1}
                value={endId}
                onChange={(e) => setEndId(Number(e.target.value))}
                disabled={running}
              />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label" htmlFor="delay-input">Delay Between Requests (ms)</label>
              <input
                id="delay-input"
                className="form-input"
                type="number"
                min={0}
                max={5000}
                step={50}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                disabled={running}
              />
              <p className="form-hint">Lower = faster enumeration. 0 = no throttle.</p>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              {!running ? (
                <button
                  id="run-attack-btn"
                  className="btn btn-danger w-full"
                  style={{ justifyContent:'center' }}
                  onClick={runAttack}
                >
                  <Play size={14} /> Launch Attack
                </button>
              ) : (
                <button
                  id="stop-attack-btn"
                  className="btn btn-ghost w-full"
                  style={{ justifyContent:'center' }}
                  onClick={stopAttack}
                >
                  <Square size={14} /> Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Zap size={15} /> Live Statistics</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            <StatsBox label="Requests Sent"   value={stats.total}     color="var(--text-primary)" />
            <StatsBox label="Docs Stolen"      value={stats.hits}      color="var(--danger-light)" />
            <StatsBox label="404 Not Found"    value={stats.misses}    color="var(--text-muted)"   />
            <StatsBox label="403 Blocked"      value={stats.forbidden} color="var(--success-light)" />
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:6 }}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className={`progress-bar-fill ${isVulnerable ? '' : 'success'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {stolenDocs.length > 0 && (
            <button
              id="export-loot-btn"
              className="btn btn-ghost btn-sm w-full"
              style={{ justifyContent:'center', marginTop:4 }}
              onClick={exportLoot}
            >
              <Download size={13} /> Export Stolen Docs ({stolenDocs.length})
            </button>
          )}
        </div>
      </div>

      {/* Terminal / Console */}
      <div className="attack-console" id="attack-terminal">
        <div className="attack-console-header">
          <div className="attack-console-title">
            <div className="terminal-dots">
              <div className="terminal-dot" style={{ background:'#ff5f57' }} />
              <div className="terminal-dot" style={{ background:'#febc2e' }} />
              <div className="terminal-dot" style={{ background:'#28c840' }} />
            </div>
            <Terminal size={13} />
            attacker@idor-poc ~ bash
          </div>
          <button
            className="btn btn-ghost btn-sm"
            id="clear-console-btn"
            onClick={() => setLogs([])}
            disabled={running}
          >
            Clear
          </button>
        </div>
        <div className="attack-console-body" ref={consoleRef} id="console-output">
          {logs.length === 0 ? (
            <span className="log-dim">
              {`# Configure attack parameters above and click "Launch Attack"\n# to begin the IDOR enumeration simulation.\n`}
            </span>
          ) : logs.map((l, i) => (
            <LogLine key={i} entry={l} />
          ))}
          {running && (
            <div className="log-line">
              <span className="log-time">[{ts()}]</span>
              <span className="log-warn" style={{ animation:'pulse-dot 1s infinite' }}>▍</span>
            </div>
          )}
        </div>
      </div>

      {/* Stolen docs table */}
      {stolenDocs.length > 0 && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="card-header" style={{ padding:'14px 18px', background:'var(--danger-bg)', borderBottomColor:'rgba(239,68,68,0.15)' }}>
            <span className="card-title" style={{ color:'var(--danger-light)' }}>
              <AlertTriangle size={15} /> Exfiltrated Documents ({stolenDocs.length})
            </span>
          </div>
          <div className="doc-table-wrap">
            <table className="doc-table" id="stolen-docs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>True Owner</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {stolenDocs.map((d, i) => {
                  const id  = d._id ?? d.id ?? d.documentId ?? i;
                  const cls = (d.classification ?? 'CONFIDENTIAL').toUpperCase();
                  const clsClass = {
                    CONFIDENTIAL: 'classification-confidential',
                    SECRET:       'classification-secret',
                    INTERNAL:     'classification-internal',
                    PUBLIC:       'classification-public',
                  }[cls] ?? 'classification-internal';
                  return (
                    <tr key={i}>
                      <td><span className="doc-id-tag">{id}</span></td>
                      <td style={{ color:'var(--text-primary)', fontWeight:500 }}>
                        {d.title ?? d.name ?? `Document #${id}`}
                      </td>
                      <td>{d.owner?.firstName ? d.owner.firstName + ' ' + (d.owner.lastName||'') : d.owner?.email ? d.owner.email : '?'}</td>
                      <td>
                        <span className={`doc-classification ${clsClass}`}>{cls}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
