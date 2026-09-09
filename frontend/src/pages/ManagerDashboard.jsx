import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Target, Award, Building, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/dashboard/');
      setData(res.data);
    } catch (err) {
      console.error('Error al obtener datos analíticos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Cargando métricas ejecutivas desde Django REST Analytics API...
      </div>
    );
  }

  const { overview, departments } = data || {};

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Dashboard Ejecutivo de Talento & Rendimiento</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Visión consolidada de KPIs, objetivos de departamento y métricas 360°
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Total Empleados
            </span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {overview?.total_users || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
            ✓ {overview?.total_departments || 0} Departamentos activos
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Progreso OKR Global
            </span>
            <TrendingUp size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {overview?.avg_okr_progress || 0}%
          </div>
          <div className="progress-bar-container" style={{ marginTop: '0.2rem' }}>
            <div className="progress-bar-fill" style={{ width: `${overview?.avg_okr_progress}%` }} />
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Puntuación 360° Media
            </span>
            <Award size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {overview?.avg_performance_score || 0} / 5.0
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Basado en evaluaciones aprobadas
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              OKRs Completados
            </span>
            <CheckCircle2 size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {overview?.completed_okrs || 0} / {overview?.total_okrs || 0}
          </div>
          {overview?.at_risk_okrs > 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>
              ⚠️ {overview.at_risk_okrs} {overview.at_risk_okrs === 1 ? 'OKR en Riesgo' : 'OKRs en Riesgo'}
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }}>
              ✓ 0 OKRs en Riesgo
            </div>
          )}
        </div>
      </div>

      {/* Analytics Chart & Department Breakdown */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="var(--primary)" /> Rendimiento por Departamento (%)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {departments && departments.map((dept) => (
              <div key={dept.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: '600' }}>{dept.name}</span>
                  <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{dept.avg_progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${dept.avg_progress}%` }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {dept.member_count} Miembros • {dept.okr_count} Objetivos
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--secondary)" /> Estado General de Objetivos OKR
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '80%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ fontWeight: '600' }}>Completados</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{overview?.completed_okrs || 0}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span style={{ fontWeight: '600' }}>En Progreso</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{overview?.in_progress_okrs || 0}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)' }} />
                <span style={{ fontWeight: '600' }}>En Riesgo</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{overview?.at_risk_okrs || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
