import React, { useState, useEffect } from 'react';
import {
  FileText, Lock, Eye, Download, AlertTriangle,
  CheckCircle, RefreshCw, Shield, Clock, Tag, Plus
} from 'lucide-react';
import { getMyDocuments, getDocumentById, createDocument } from '../api';
import { useAuth } from '../AuthContext';
import DocumentModal from '../components/DocumentModal';

const CLS_STYLES = {
  CONFIDENTIAL: 'classification-confidential',
  SECRET:       'classification-secret',
  INTERNAL:     'classification-internal',
  PUBLIC:       'classification-public',
};

function classificationLabel(cls) {
  const map = { CONFIDENTIAL:'🔴', SECRET:'🟣', INTERNAL:'🟡', PUBLIC:'🟢' };
  return (map[cls?.toUpperCase()] ?? '⚪') + ' ' + (cls ?? 'UNKNOWN');
}

function skeletonRows(n = 5) {
  return Array.from({ length: n }).map((_, i) => (
    <tr key={i}>
      {[140, 100, 220, 80, 90, 60].map((w, j) => (
        <td key={j}>
          <div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  ));
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs,       setDocs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [selected,   setSelected]   = useState(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyDocuments();
      // Handle both array and { documents: [] } shapes
      setDocs(Array.isArray(data) ? data : (data.documents ?? data.content ?? []));
    } catch (e) {
      setError(e?.response?.data?.message ?? e.message ?? 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const openDoc = async (doc) => {
    setModalOpen(true);
    setModalLoading(true);
    setSelected(null);
    try {
      const full = await getDocumentById(doc.id ?? doc.documentId);
      setSelected(full);
    } catch {
      setSelected(doc); // fallback to list data
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await createDocument(createTitle, createContent);
      setCreateTitle('');
      setCreateContent('');
      await fetchDocs();
    } catch (e) {
      setCreateError(e?.response?.data?.message ?? e.message ?? 'Failed to create document');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <FileText size={22} style={{ display:'inline', marginRight:8, color:'var(--indigo-light)', verticalAlign:'middle' }} />
            My Documents
          </h2>
          <p className="page-subtitle">
            Confidential records associated with your account
          </p>
        </div>
        <button id="refresh-docs" className="btn btn-ghost" onClick={fetchDocs} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert — access-control info */}
      <div className="alert-banner info">
        <CheckCircle size={16} className="alert-icon" />
        <div>
          <strong>Authenticated as:</strong> <code style={{ fontFamily:'var(--font-mono)', color:'var(--cyan-light)' }}>{user?.username}</code>
          &nbsp;— The documents below belong to your account. In the <strong>vulnerable phase</strong>, any other
          authenticated user can access these by guessing the sequential IDs.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-banner danger">
          <AlertTriangle size={16} className="alert-icon" />
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {/* Create Document Section */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-color)' }}>
          <span className="card-title">
            <Plus size={16} />
            Create New Document
          </span>
        </div>
        <form onSubmit={handleCreateDocument} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {createError && (
            <div className="alert-banner danger" style={{ marginBottom: '8px' }}>
              <AlertTriangle size={16} className="alert-icon" />
              <div><strong>Error:</strong> {createError}</div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="create-title" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Title
            </label>
            <input
              id="create-title"
              type="text"
              placeholder="Document title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              required
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="create-content" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Content
            </label>
            <textarea
              id="create-content"
              placeholder="Document content"
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              required
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                minHeight: '100px',
                resize: 'vertical',
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createLoading || !createTitle.trim() || !createContent.trim()}
            style={{ marginTop: '8px' }}
          >
            <Plus size={14} style={{ marginRight: '6px' }} />
            {createLoading ? 'Creating...' : 'Create Document'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-banner danger">
          <AlertTriangle size={16} className="alert-icon" />
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <span className="card-title">
            <FileText size={16} />
            Document Records
          </span>
          <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
            {loading ? '…' : `${docs.length} record${docs.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="doc-table-wrap">
          <table className="doc-table" id="documents-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Classification</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? skeletonRows() : docs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <FileText size={40} className="empty-state-icon" />
                      <p>No documents found for your account.</p>
                    </div>
                  </td>
                </tr>
              ) : docs.map((doc, i) => {
                const id = doc.id ?? doc.documentId ?? i;
                const cls = (doc.classification ?? 'INTERNAL').toUpperCase();
                return (
                  <tr key={id}>
                    <td>
                      <span className="doc-id-tag">{id}</span>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {doc.title ?? doc.name ?? `Document #${id}`}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div
                          style={{
                            width:22, height:22, borderRadius:'50%',
                            background:'var(--indigo)', display:'flex',
                            alignItems:'center', justifyContent:'center',
                            fontSize:'0.65rem', fontWeight:700, color:'white', flexShrink:0,
                          }}
                        >
                          {((doc.owner && doc.owner.firstName) ? doc.owner.firstName : (doc.owner && doc.owner.email) ? doc.owner.email : user?.firstName ?? user?.email ?? '?')[0].toUpperCase()}
                        </div>
                        {(doc.owner && doc.owner.firstName) ? doc.owner.firstName + ' ' + (doc.owner.lastName || '') : (doc.owner && doc.owner.email) ? doc.owner.email : user?.firstName ?? user?.email}
                      </div>
                    </td>
                    <td>
                      <span className={`doc-classification ${CLS_STYLES[cls] ?? 'classification-internal'}`}>
                        {classificationLabel(cls)}
                      </span>
                    </td>
                    <td style={{ whiteSpace:'nowrap' }}>
                      {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <button
                        id={`view-doc-${id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => openDoc(doc)}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document modal */}
      {modalOpen && (
        <DocumentModal
          doc={selected}
          loading={modalLoading}
          onClose={() => { setModalOpen(false); setSelected(null); }}
          isUnauthorized={false}
        />
      )}
    </div>
  );
}
