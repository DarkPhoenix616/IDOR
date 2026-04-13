import React from 'react';
import { X, FileText, AlertTriangle, Lock, Clock, Tag, User } from 'lucide-react';

const CLS_STYLES = {
  CONFIDENTIAL: 'classification-confidential',
  SECRET:       'classification-secret',
  INTERNAL:     'classification-internal',
  PUBLIC:       'classification-public',
};

export default function DocumentModal({ doc, loading, onClose, isUnauthorized }) {
  return (
    <div className="modal-overlay" id="doc-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="doc-modal">
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:'var(--radius-md)',
              background: isUnauthorized ? 'var(--danger-bg)' : 'rgba(99,102,241,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center',
              border: `1px solid ${isUnauthorized ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
            }}>
              {isUnauthorized ? <AlertTriangle size={18} color="var(--danger-light)" /> : <FileText size={18} color="var(--indigo-light)" />}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>
                {loading ? 'Loading…' : (doc?.title ?? doc?.name ?? `Document #${doc?.id ?? doc?.documentId ?? '?'}`)}
              </div>
              {isUnauthorized && <div style={{ fontSize:'0.72rem', color:'var(--danger-light)', marginTop:1 }}>⚠ Unauthorized Access (IDOR)</div>}
            </div>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--text-muted)', borderRadius:'var(--radius-sm)', padding:4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[200, 160, 280, 120].map((w, i) => (
                <div key={i} className="skeleton" style={{ height:16, width:w, borderRadius:4 }} />
              ))}
              <div className="skeleton" style={{ height:80, borderRadius:8, marginTop:8 }} />
            </div>
          ) : !doc ? (
            <div className="empty-state">
              <Lock size={36} className="empty-state-icon" />
              <p>Could not load document</p>
            </div>
          ) : (
            <>
              {isUnauthorized && (
                <div className="alert-banner danger" style={{ marginBottom:16 }}>
                  <AlertTriangle size={14} className="alert-icon" />
                  <div>
                    <strong>IDOR Confirmed:</strong> This document does not belong to you.
                    The backend returned it without any ownership validation.
                  </div>
                </div>
              )}

              {/* Meta grid */}
              <div className="meta-grid">
                <div className="meta-item">
                  <div className="meta-item-label">Document ID</div>
                  <div className="meta-item-value text-mono" style={{ color:'var(--indigo-light)' }}>
                    {doc.id ?? doc.documentId ?? '—'}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-item-label">Classification</div>
                  <div className="meta-item-value">
                    <span className={`doc-classification ${CLS_STYLES[(doc.classification ?? 'INTERNAL').toUpperCase()] ?? 'classification-internal'}`}>
                      {doc.classification ?? 'INTERNAL'}
                    </span>
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-item-label"><User size={11} style={{ display:'inline', marginRight:3 }} />Owner</div>
                  <div className="meta-item-value">
                    {doc.owner ?? doc.ownerUsername ?? doc.userId ?? '—'}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-item-label"><Clock size={11} style={{ display:'inline', marginRight:3 }} />Created</div>
                  <div className="meta-item-value">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:6 }}>
                  Document Content
                </div>
                <div className="doc-content-box">
                  {doc.content ?? doc.body ?? doc.description ?? '[ No content available ]'}
                </div>
              </div>

              {/* Tags */}
              {(doc.tags ?? doc.keywords) && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>
                  <Tag size={12} style={{ color:'var(--text-muted)', alignSelf:'center' }} />
                  {(doc.tags ?? doc.keywords ?? '').split(',').map((t, i) => (
                    <span key={i} className="tag tag-safe">{t.trim()}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button id="close-modal-footer-btn" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
