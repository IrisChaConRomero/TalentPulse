import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Activity, LayoutDashboard, Target, Award, MessageSquare,
  LogOut, Settings
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin"><span className="status-dot" /> ADMIN / CTO</span>;
      case 'MANAGER':
        return <span className="badge badge-manager"><span className="status-dot" /> MANAGER</span>;
      default:
        return <span className="badge badge-employee"><span className="status-dot" /> EMPLEADO</span>;
    }
  };

  return (
    <header className="navbar">
      <div className="nav-brand notranslate" translate="no">
        <span className="nav-logo-badge">
          <Activity size={18} color="#67e8f9" />
          TP
        </span>
        <span className="nav-brand-title">TalentPulse</span>
      </div>

      <nav className="nav-links" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {user.role === 'ADMIN' && (
          <button
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={16} />
            Configuración Admin
          </button>
        )}

        {user.role !== 'EMPLOYEE' && (
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <LayoutDashboard size={16} />
            {user.role === 'ADMIN' ? 'Dashboard Global' : 'Mi Equipo & KPIs'}
          </button>
        )}

        <button
          className={`nav-item ${activeTab === 'okrs' ? 'active' : ''}`}
          onClick={() => setActiveTab('okrs')}
        >
          <Target size={16} />
          {user.role === 'EMPLOYEE' ? 'Mis OKRs & Objetivos' : 'OKRs & Objetivos'}
        </button>

        <button
          className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Award size={16} />
          Evaluaciones 360°
        </button>

        <button
          className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquare size={16} />
          Feedback
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '700', fontSize: '0.92rem', fontFamily: 'var(--font-heading)' }}>
            {user.first_name || user.username}
          </div>
          <div style={{ marginTop: '0.15rem' }}>
            {getRoleBadge(user.role)}
          </div>
        </div>

        <button className="btn btn-secondary" onClick={logout} title="Cerrar sesión" style={{ padding: '0.55rem 1.1rem' }}>
          <LogOut size={15} />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;
