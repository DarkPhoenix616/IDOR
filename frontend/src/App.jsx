import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { PhaseProvider } from './PhaseContext';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import DocumentsPage from './pages/DocumentsPage';
import AttackPage from './pages/AttackPage';
import MitigationsPage from './pages/MitigationsPage';
import Navbar, { Sidebar } from './components/Navbar';

// ── Inner App — rendered inside providers ─────────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        flexDirection:'column', gap:16, color:'var(--text-muted)',
      }}>
        <div style={{ fontSize:'2rem', animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</div>
        <p style={{ fontSize:'0.86rem' }}>Loading session…</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewPage />;
      case 'documents':   return <DocumentsPage />;
      case 'attack':      return <AttackPage />;
      case 'mitigations': return <MitigationsPage />;
      default:            return <OverviewPage />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="dashboard">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content" id="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PhaseProvider>
          <AppInner />
        </PhaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
