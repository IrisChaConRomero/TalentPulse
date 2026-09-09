import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, KeyRound, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const { login, authError } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(username, password);
    setIsSubmitting(false);
  };

  const setDemoUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <Activity size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>TalentPulse</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Plataforma Integral de Gestión del Talento & OKRs
          </p>
        </div>

        {authError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.8rem 1rem',
            color: '#f87171',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={18} />
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. admin"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            <KeyRound size={18} />
            {isSubmitting ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textAlign: 'center', fontWeight: '600' }}>
            ⚡ Accesos Rápida Demostración Docente:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
              onClick={() => setDemoUser('admin', 'admin123')}
            >
              <span>👑 Administrator / CTO</span>
              <code>admin / admin123</code>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
              onClick={() => setDemoUser('manager_marta', 'manager123')}
            >
              <span>👔 Manager (Marta)</span>
              <code>manager_marta / manager123</code>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
              onClick={() => setDemoUser('carlos_dev', 'empleado123')}
            >
              <span>💼 Empleado (Carlos)</span>
              <code>carlos_dev / empleado123</code>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
