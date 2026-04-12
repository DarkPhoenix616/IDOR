import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docId, setDocId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('my-docs');

    // Attacker mode states
    const [attackDocId, setAttackDocId] = useState('');
    const [attackTitle, setAttackTitle] = useState('');
    const [attackContent, setAttackContent] = useState('');
    const [attackLoading, setAttackLoading] = useState(false);
    const [attackAction, setAttackAction] = useState('view');

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        console.log('User data from localStorage:', userData);
        
        if (!userData) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);
        
        if (parsedUser.userId) {
            loadUserDocuments(parsedUser.userId);
        } else {
            console.error('No userId in user data!');
        }
    }, [navigate]);

    const loadUserDocuments = async (userId) => {
        try {
            const response = await documentService.getUserDocuments(userId);
            console.log('Documents loaded for user', userId, ':', response.data);
            // Handle both array response and nested response structures
            const docsArray = Array.isArray(response.data) ? response.data : (response.data?.documents || []);
            setDocuments(docsArray);
        } catch (err) {
            console.error('Error loading documents:', err);
            setDocuments([]);
        }
    };

    const handleAccessDocument = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSelectedDoc(null);
        setLoading(true);

        if (!docId.trim()) {
            setError('Please enter a document ID');
            setLoading(false);
            return;
        }

        try {
            const response = await documentService.getDocument(parseInt(docId));
            setSelectedDoc(response.data);
            setSuccess(`✓ Successfully accessed document #${docId}`);
            setDocId('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Document #${docId} not found`);
            } else {
                setError('Failed to access document');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAttackAction = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setAttackLoading(true);

        if (!attackDocId.trim()) {
            setError('Please enter a document ID');
            setAttackLoading(false);
            return;
        }

        try {
            const docIdNum = parseInt(attackDocId);

            if (attackAction === 'view') {
                const response = await documentService.getDocument(docIdNum);
                setSelectedDoc(response.data);
                setSuccess(`✓ Read access granted! Viewed document #${attackDocId}`);
            } else if (attackAction === 'modify') {
                if (!attackTitle.trim() || !attackContent.trim()) {
                    setError('Please enter both title and content');
                    setAttackLoading(false);
                    return;
                }
                await documentService.updateDocument(docIdNum, attackTitle, attackContent);
                setSuccess(`✓ Document #${attackDocId} has been modified successfully!`);
                setAttackTitle('');
                setAttackContent('');
            } else if (attackAction === 'delete') {
                const deleteResponse = await documentService.deleteDocument(docIdNum);
                setSuccess(`✓ Document #${attackDocId} has been permanently deleted!`);
            }

            setAttackDocId('');
            setSelectedDoc(null);
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Document #${attackDocId} not found`);
            } else {
                setError(`Operation failed: ${err.message}`);
            }
        } finally {
            setAttackLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container">
                    <span className="navbar-brand">
                        <i className="bi bi-shield-lock"></i>
                        IDOR Defense Lab
                    </span>
                    <div className="ms-auto d-flex align-items-center gap-3">
                        {user && (
                            <>
                                <span className="text-light" style={{ fontSize: '0.95rem' }}>
                                    <i className="bi bi-person-circle"></i> {user.firstName} {user.lastName}
                                </span>
                                <button className="btn-logout" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="main-content">
                <div className="container">
                    {/* Header */}
                    <div className="page-header">
                        <h1><i className="bi bi-folder-check"></i> Document Management System</h1>
                        <p className="lead">Educational IDOR Vulnerability Demonstration Lab</p>
                    </div>

                    {/* Alert */}
                    {activeTab === 'my-docs' && documents.length === 0 && (
                        <div className="alert alert-info mb-4">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>No documents yet.</strong> Documents from other users are accessible through the Attacker Mode tab.
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger mb-4">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success mb-4">
                            <i className="bi bi-check-circle me-2"></i>
                            {success}
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <ul className="nav nav-tabs mb-4" role="tablist">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'my-docs' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('my-docs');
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                <i className="bi bi-file-earmark"></i> My Documents
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'explore' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('explore');
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                <i className="bi bi-search"></i> Explore System
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'attack' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('attack');
                                    setError('');
                                    setSuccess('');
                                }}
                                style={{
                                    color: activeTab === 'attack' ? 'var(--danger)' : '#94a3b8',
                                }}
                            >
                                <i className="bi bi-lightning-fill"></i> Attacker Mode
                            </button>
                        </li>
                    </ul>

                    {/* My Documents Tab */}
                    {activeTab === 'my-docs' && (
                        <div>
                            <div className="row mb-4">
                                <div className="col-md-8">
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
                                        <i className="bi bi-file-earmark-text"></i> Your Documents ({documents.length})
                                    </h2>
                                </div>
                            </div>

                            {documents.length === 0 ? (
                                <div className="card">
                                    <div className="card-body text-center py-5">
                                        <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: '#94a3b8' }}></i>
                                        <p className="text-muted mt-3">No documents uploaded yet</p>
                                    </div>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div key={doc.id} className="document-card">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="mb-2">
                                                    <i className="bi bi-file-text"></i> {doc.title}
                                                </h5>
                                                <p className="mb-2" style={{ color: '#e2e8f0' }}>{doc.content}</p>
                                                <div className="doc-owner">
                                                    <i className="bi bi-person"></i> Document ID: <span className="doc-id">#{doc.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Explore System Tab */}
                    {activeTab === 'explore' && (
                        <div>
                            <div className="row mb-4">
                                <div className="col-md-8">
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                                        <i className="bi bi-search"></i> Explore Document System
                                    </h2>
                                    <p style={{ color: '#94a3b8' }}>Browse documents by ID to understand the vulnerability</p>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <i className="bi bi-search"></i> Access Any Document
                                </div>
                                <div className="card-body">
                                    <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                        Enter document ID to view its contents. Try IDs: <strong>1, 2, 3, 4, 5, 6, 7, 8, 9</strong>
                                    </p>

                                    <form onSubmit={handleAccessDocument}>
                                        <div className="input-group mb-3">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter Document ID (1-9)"
                                                value={docId}
                                                onChange={(e) => setDocId(e.target.value)}
                                                min="1"
                                                disabled={loading}
                                            />
                                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-search me-2"></i>Access
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {selectedDoc && (
                                        <div className="document-card warning mt-4">
                                            <div className="d-flex gap-2 mb-3">
                                                <span className="badge badge-warning">
                                                    <i className="bi bi-exclamation-triangle"></i> ACCESS GRANTED
                                                </span>
                                            </div>
                                            <h5><i className="bi bi-file-earmark"></i> {selectedDoc.title}</h5>
                                            <p style={{ color: '#e2e8f0', margin: '15px 0' }}>
                                                <strong>Content:</strong> {selectedDoc.content}
                                            </p>
                                            <div className="doc-owner">
                                                <i className="bi bi-person"></i> <strong>Owner:</strong> {selectedDoc.owner.firstName} {selectedDoc.owner.lastName} ({selectedDoc.owner.email})
                                            </div>
                                            <div className="alert alert-danger mt-3 mb-0" style={{ marginTop: '15px' }}>
                                                <i className="bi bi-exclamation-circle"></i>
                                                <strong> Vulnerability Detected!</strong> You accessed a document owned by {selectedDoc.owner.firstName} {selectedDoc.owner.lastName}. The system authenticated you but didn't verify authorization.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attacker Mode Tab */}
                    {activeTab === 'attack' && (
                        <div>
                            <div className="row mb-4">
                                <div className="col-md-8">
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--danger)' }}>
                                        <i className="bi bi-lightning-fill"></i> Attacker Mode - Full Access
                                    </h2>
                                    <p style={{ color: '#94a3b8' }}>Exploit the IDOR vulnerability - Read, Modify, or Delete any document</p>
                                </div>
                            </div>

                            <div className="alert alert-danger mb-4">
                                <i className="bi bi-fire"></i>
                                <strong> Critical Vulnerability:</strong> You can modify or delete ANY document without authorization. Documents can be changed or destroyed permanently.
                            </div>

                            <div className="card">
                                <div className="card-header" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                                    <i className="bi bi-lightning-fill"></i> Attack Configuration
                                </div>
                                <div className="card-body">
                                    <div className="mb-4">
                                        <label className="form-label"><strong>Select Attack Type</strong></label>
                                        <div className="d-grid gap-2 grid-template-columns-3">
                                            {[
                                                { value: 'view', label: '👁️ View', desc: 'Read document' },
                                                { value: 'modify', label: '✏️ Modify', desc: 'Edit content' },
                                                { value: 'delete', label: '🗑️ Delete', desc: 'Destroy document' },
                                            ].map((action) => (
                                                <button
                                                    key={action.value}
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        background: attackAction === action.value
                                                            ? action.value === 'delete' ? 'linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)'
                                                                : action.value === 'modify' ? 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)'
                                                                    : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                                                            : 'var(--card-bg)',
                                                        color: attackAction === action.value ? 'white' : '#cbd5e1',
                                                        border: '1px solid ' + (attackAction === action.value ? 'transparent' : 'var(--border)'),
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.3s',
                                                    }}
                                                    onClick={() => setAttackAction(action.value)}
                                                >
                                                    <div>{action.label}</div>
                                                    <small style={{ opacity: 0.8 }}>{action.desc}</small>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={handleAttackAction}>
                                        <div className="mb-3">
                                            <label className="form-label"><strong>Target Document ID</strong></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter document ID (1-9)"
                                                value={attackDocId}
                                                onChange={(e) => setAttackDocId(e.target.value)}
                                                min="1"
                                                disabled={attackLoading}
                                            />
                                            <small className="text-muted">Try IDs: 1, 2, 3, 4, 5, 6, 7, 8, 9</small>
                                        </div>

                                        {attackAction === 'modify' && (
                                            <>
                                                <div className="mb-3">
                                                    <label className="form-label"><strong>New Title</strong></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter new title"
                                                        value={attackTitle}
                                                        onChange={(e) => setAttackTitle(e.target.value)}
                                                        disabled={attackLoading}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label"><strong>New Content</strong></label>
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Enter new content"
                                                        value={attackContent}
                                                        onChange={(e) => setAttackContent(e.target.value)}
                                                        rows="3"
                                                        disabled={attackLoading}
                                                    ></textarea>
                                                </div>
                                            </>
                                        )}

                                        {attackAction === 'delete' && (
                                            <div className="alert alert-danger mb-3">
                                                <i className="bi bi-exclamation-triangle"></i>
                                                <strong> Permanent Action:</strong> This will irreversibly delete the document and all its contents.
                                            </div>
                                        )}

                                        <button
                                            className="btn w-100"
                                            style={{
                                                background: attackAction === 'delete' ? 'linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)'
                                                    : attackAction === 'modify' ? 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)'
                                                        : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                cursor: attackLoading ? 'not-allowed' : 'pointer',
                                                opacity: attackLoading ? 0.6 : 1,
                                            }}
                                            type="submit"
                                            disabled={attackLoading}
                                        >
                                            {attackLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    {attackAction === 'view' && '👁️ View Document'}
                                                    {attackAction === 'modify' && '✏️ Modify Document'}
                                                    {attackAction === 'delete' && '🗑️ Delete Document'}
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {selectedDoc && attackAction === 'view' && (
                                        <div className="document-card danger mt-4">
                                            <div className="d-flex gap-2 mb-3">
                                                <span className="badge badge-danger">
                                                    <i className="bi bi-exclamation-triangle"></i> UNAUTHORIZED ACCESS
                                                </span>
                                            </div>
                                            <h5><i className="bi bi-file-earmark"></i> {selectedDoc.title}</h5>
                                            <p style={{ color: '#e2e8f0', margin: '15px 0' }}>
                                                <strong>Content:</strong> {selectedDoc.content}
                                            </p>
                                            <div className="doc-owner">
                                                <i className="bi bi-person"></i> <strong>Owner:</strong> {selectedDoc.owner.firstName} {selectedDoc.owner.lastName}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card mt-4">
                                <div className="card-header">
                                    <i className="bi bi-exclamation-circle"></i> Real-World Impact
                                </div>
                                <div className="card-body">
                                    <ul style={{ color: '#cbd5e1' }}>
                                        <li><strong style={{ color: 'var(--danger)' }}>Data Theft:</strong> Steal sensitive information (SSN, medical records, financial data)</li>
                                        <li><strong style={{ color: 'var(--danger)' }}>Data Manipulation:</strong> Alter critical documents and records</li>
                                        <li><strong style={{ color: 'var(--danger)' }}>Data Destruction:</strong> Delete business-critical documents permanently</li>
                                        <li><strong style={{ color: 'var(--danger)' }}>Reputation Damage:</strong> Modify documents to defame or frame users</li>
                                        <li><strong style={{ color: 'var(--danger)' }}>Compliance Violation:</strong> Breach GDPR, HIPAA, and other regulations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </>
    );
}
