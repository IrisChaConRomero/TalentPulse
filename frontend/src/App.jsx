import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ReviewsPage from './pages/ReviewsPage';
import FeedbackPage from './pages/FeedbackPage';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('okrs');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        Cargando TalentPulse...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'analytics':
        return user.role !== 'EMPLOYEE' ? <ManagerDashboard /> : <EmployeeDashboard />;
      case 'okrs':
        return <EmployeeDashboard />;
      case 'reviews':
        return <ReviewsPage />;
      case 'feedback':
        return <FeedbackPage />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderTab()}
      </main>
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
