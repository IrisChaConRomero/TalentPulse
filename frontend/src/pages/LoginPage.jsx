import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Activity, ShieldAlert, KeyRound, Sparkles, Settings,
  Wind, Target, Layers, CheckCircle2, Award
} from 'lucide-react';

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
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Orbes ambientales estilo Web Personal de Iris Chacón */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Barra Superior de Presentación */}
      <header className="navbar" style={{ position: 'relative' }}>
        <div className="nav-brand notranslate" translate="no">
          <span className="nav-logo-badge">
            <Activity size={18} color="#67e8f9" />
            TP
          </span>
          <span className="nav-brand-title">TalentPulse</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span className="badge badge-status-completed" style={{ textTransform: 'none', fontSize: '0.76rem' }}>
            <span className="status-dot" /> PFM Aprobado · Enterprise Edition
          </span>
          <span className="chip" style={{ padding: '0.3rem 0.85rem', fontSize: '0.76rem' }}>
            Iris Chacón Romero · Full Stack Developer
          </span>
        </div>
      </header>

      {/* Contenedor Principal Maquetado en 2 Columnas (Estilo Hero + About Grid de la Web Personal) */}
      <main style={{
        maxWidth: '1220px',
        width: '100%',
        margin: '0 auto',
        padding: '2.5rem 2rem',
        position: 'relative',
        zIndex: 2,
        flex: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.95fr', alignItems: 'stretch', width: '100%', gap: '2.2rem' }}>

          {/* Columna Izquierda: Showcase Arquitectónico estilo Web Personal */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem' }}>
            <div>
              <div className="section-label">
                <span className="status-dot" />
                <span>Arquitectura Full Stack · OKRs, IA &amp; Bienestar</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.3rem, 4.2vw, 3.4rem)',
                fontWeight: '800',
                lineHeight: '1.08',
                marginBottom: '1.1rem',
                color: '#ffffff'
              }}>
                <span className="notranslate" translate="no">
                  Talent<span className="gradient-text">Pulse</span>
                </span>
              </h1>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.75',
                marginBottom: '1.4rem'
              }}>
                Plataforma corporativa para la dirección estratégica de <strong>Objetivos (OKRs)</strong>,
                <strong> Evaluaciones de Desempeño 360°</strong>, <strong>Copiloto de Inteligencia Artificial</strong> personalizado
                para los 3 roles y <strong>Espacio de Autorrelajación (Wellness Hub)</strong>.
              </p>

              {/* Grid Simétrico Ordenado de 6 Burbujas de Arquitectura (2x3 alineado al milímetro) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.65rem',
                  marginBottom: '1.8rem'
                }}
              >
                <div className="chip" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.58rem 0.9rem', borderRadius: '12px' }}>
                  <Settings size={15} color="#fca5a5" style={{ flexShrink: 0 }} />
                  <span>Configuración Admin &amp; RBAC</span>
                </div>
                <div className="chip" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.58rem 0.9rem', borderRadius: '12px' }}>
                  <Sparkles size={15} color="#67e8f9" style={{ flexShrink: 0 }} />
                  <span>Copiloto IA (3 Perfiles)</span>
                </div>
                <div className="chip" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.58rem 0.9rem', borderRadius: '12px' }}>
                  <Wind size={15} color="#34d399" style={{ flexShrink: 0 }} />
                  <span>Wellness &amp; Música HD</span>
                </div>
                <div className="chip" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.58rem 0.9rem', borderRadius: '12px' }}>
                  <Target size={15} color="#a5b4fc" style={{ flexShrink: 0 }} />
                  <span>OKRs &amp; Key Results en Vivo</span>
                </div>
                <div className="chip" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.58rem 0.9rem', borderRadius: '12px' }}>
                  <Award size={15} color="#f472b6" style={{ flexShrink: 0 }} />
                  <span>Evaluaciones 360° &amp; Feedback</span>
                </div>
                <div className="chip" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.58rem 0.9rem', borderRadius: '12px' }}>
                  <Layers size={15} color="#fcd34d" style={{ flexShrink: 0 }} />
                  <span>Django 5 REST + React 18</span>
                </div>
              </div>
            </div>

            {/* Bloque de Estadísticas inspirado en .about-stats de la Web Personal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.9rem',
              paddingTop: '1.4rem',
              borderTop: '1px solid rgba(99, 102, 241, 0.25)'
            }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.09)',
                border: '1px solid rgba(99, 102, 241, 0.28)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 0.6rem',
                textAlign: 'center'
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: '800', color: 'var(--secondary-light)' }}>
                  3 Roles
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  RBAC Diferenciado
                </div>
              </div>

              <div style={{
                background: 'rgba(6, 182, 212, 0.09)',
                border: '1px solid rgba(6, 182, 212, 0.28)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 0.6rem',
                textAlign: 'center'
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: '800', color: '#a5b4fc' }}>
                  IA Híbrida
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Asistente &amp; Generador
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.09)',
                border: '1px solid rgba(16, 185, 129, 0.28)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 0.6rem',
                textAlign: 'center'
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-light)' }}>
                  11 / 11
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Tests Automatizados
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Portal de Acceso & Selector de Perfiles */}
          <div className="glass-card" style={{ padding: '2.3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.5rem' }}>
                <div className="icon-badge-box">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff' }}>
                    Acceso a <span className="notranslate" translate="no">TalentPulse</span>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Autenticación por Token DRF y control de sesión por rol
                  </p>
                </div>
              </div>

              {authError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '0.8rem 1rem',
                  color: '#f87171',
                  marginBottom: '1.2rem',
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
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.3rem', padding: '0.85rem' }}
                  disabled={isSubmitting}
                >
                  <KeyRound size={18} />
                  {isSubmitting ? 'Autenticando en Django API...' : 'Entrar a la Plataforma'}
                </button>
              </form>
            </div>

            <div style={{ marginTop: '1.6rem', paddingTop: '1.3rem', borderTop: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <p style={{ fontSize: '0.76rem', color: 'var(--secondary-light)', marginBottom: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>
                ⚡ Selección Rápida 1-Clic (3 Perfiles Diferenciados):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <button
                  type="button"
                  className="module-pill-item"
                  onClick={() => setDemoUser('admin', 'admin123')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="#fca5a5" />
                    <span>👑 <strong>Admin / CTO</strong> (Configuración Admin &amp; IA Global)</span>
                  </span>
                  <code style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>admin</code>
                </button>

                <button
                  type="button"
                  className="module-pill-item"
                  onClick={() => setDemoUser('manager_marta', 'manager123')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="#fcd34d" />
                    <span>👔 <strong>Manager</strong> (Supervisión Equipo &amp; Coach IA)</span>
                  </span>
                  <code style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>manager_marta</code>
                </button>

                <button
                  type="button"
                  className="module-pill-item"
                  onClick={() => setDemoUser('carlos_dev', 'empleado123')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="#34d399" />
                    <span>💼 <strong>Empleado</strong> (Mis OKRs &amp; Mentor IA)</span>
                  </span>
                  <code style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>carlos_dev</code>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="app-footer">
        <span>
          <strong className="notranslate" translate="no" style={{ color: '#fff' }}>TalentPulse</strong> • Diseñado y desarrollado por <strong>Iris Chacón Romero</strong> (Máster Full Stack Conquer Blocks)
        </span>
      </footer>
    </div>
  );
};

export default LoginPage;
