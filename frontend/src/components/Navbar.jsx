import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, Target, Award, MessageSquare, LogOut, User } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">ADMIN / CTO</span>;
      case 'MANAGER':
        return <span className="badge badge-manager">MANAGER</span>;
      default:
        return <span className="badge badge-employee">EMPLEADO</span>;
    }
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <Activity size={28} color="#6366f1" />
        <span>TalentPulse</span>
      </div>

      <nav className="nav-links">
        {user.role !== 'EMPLOYEE' && (
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <LayoutDashboard size={18} style={{ marginRight: '6px' }} />
            Dashboard Ejecutivo
          </button>
        )}

        <button
          className={`nav-item ${activeTab === 'okrs' ? 'active' : ''}`}
          onClick={() => setActiveTab('okrs')}
        >
          <Target size={18} style={{ marginRight: '6px' }} />
          Mis OKRs & Objetivos
        </button>

        <button
          className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Award size={18} style={{ marginRight: '6px' }} />
          Evaluaciones 360°
        </button>

        <button
          className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquare size={18} style={{ marginRight: '6px' }} />
          Feedback
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user.first_name || user.username}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {getRoleBadge(user.role)}
          </div>
        </div>

        <button className="btn btn-secondary" onClick={logout} title="Cerrar sesión">
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;
