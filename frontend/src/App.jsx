import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FloatingSmartHub from './components/FloatingSmartHub';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminPanel from './pages/AdminPanel';
import ReviewsPage from './pages/ReviewsPage';
import FeedbackPage from './pages/FeedbackPage';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('okrs');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      setActiveTab('admin');
    } else if (user?.role === 'MANAGER') {
      setActiveTab('analytics');
    } else if (user) {
      setActiveTab('okrs');
    }
  }, [user?.id, user?.role]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-heading)'
      }}>
        Cargando <span className="notranslate" translate="no" style={{ marginLeft: '6px', color: '#fff' }}>TalentPulse</span>...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'admin':
        return user.role === 'ADMIN'
          ? <AdminPanel key={refreshKey} />
          : <EmployeeDashboard key={refreshKey} setActiveTab={setActiveTab} />;
      case 'analytics':
        return user.role !== 'EMPLOYEE'
          ? <ManagerDashboard key={refreshKey} setActiveTab={setActiveTab} />
          : <EmployeeDashboard key={refreshKey} setActiveTab={setActiveTab} />;
      case 'okrs':
        return <EmployeeDashboard key={refreshKey} setActiveTab={setActiveTab} />;
      case 'reviews':
        return <ReviewsPage key={refreshKey} />;
      case 'feedback':
        return <FeedbackPage key={refreshKey} />;
      default:
        return <EmployeeDashboard key={refreshKey} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Orbes ambientales suaves */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido Principal 100% Centralizado */}
      <main className="main-content">
        {renderTab()}
      </main>

      {/* Burbuja Flotante Emergente (Copiloto IA + Autorrelajación & Pausa) */}
      <FloatingSmartHub onDataChanged={() => setRefreshKey((k) => k + 1)} />

      <footer className="app-footer">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className="status-dot" />
          <strong className="notranslate" translate="no" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            TalentPulse
          </strong>
          <span>• Arquitectura Full Stack por <strong>Iris Chacón Romero</strong></span>
          <span>• Python · Django 5 REST · React 18 · Copiloto IA &amp; Wellness Hub</span>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
