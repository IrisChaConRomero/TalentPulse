import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Target, Award, Building, TrendingUp, CheckCircle2,
  Settings, Briefcase, DollarSign
} from 'lucide-react';

const ManagerDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

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
        Cargando métricas desde Django REST Analytics API...
      </div>
    );
  }

  const { overview, departments, my_department } = data || {};

  // Si es MANAGER, priorizamos las métricas de su propio departamento
  const deptFocus = !isAdmin && my_department ? my_department : null;

  return (
    <div>
      {/* Header Diferenciado por Rol */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div className="section-label">
            <span className="status-dot" />
            <span>
              {isAdmin ? 'Vista Ejecutiva Global (ADMIN / CTO)' : `Supervisión de Equipo • ${deptFocus?.name || 'Mi Departamento'}`}
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            {isAdmin ? (
              <>Dashboard Ejecutivo <span className="gradient-text">Multi-Departamento</span></>
            ) : (
              <>Panel de Liderazgo &amp; Equipo — <span className="gradient-text">{deptFocus?.name || 'Supervisor'}</span></>
            )}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
            {isAdmin
              ? 'Visión consolidada de toda la compañía, presupuestos corporativos y rendimiento interdepartamental'
              : 'Seguimiento directo de los integrantes de tu departamento, carga de trabajo, OKRs de equipo y evaluaciones 360°'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAdmin && setActiveTab && (
            <button className="btn btn-secondary" onClick={() => setActiveTab('admin')}>
              <Settings size={16} />
              Configuración Admin
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards (Adaptadas según si es Admin Global o Manager de Departamento) */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              {isAdmin ? 'Total Empleados (Global)' : 'Miembros de Mi Equipo'}
            </span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {isAdmin ? (overview?.total_users || 0) : (deptFocus?.member_count || overview?.total_users || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
            {isAdmin
              ? `✓ ${overview?.total_departments || 0} Departamentos corporativos`
              : `✓ Unidad: ${deptFocus?.name || 'General'}`}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              {isAdmin ? 'Progreso OKR Global' : 'Avance OKR de Equipo'}
            </span>
            <TrendingUp size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {isAdmin ? (overview?.avg_okr_progress || 0) : (deptFocus?.avg_progress ?? overview?.avg_okr_progress ?? 0)}%
          </div>
          <div className="progress-bar-container" style={{ marginTop: '0.2rem' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${isAdmin ? (overview?.avg_okr_progress || 0) : (deptFocus?.avg_progress ?? overview?.avg_okr_progress ?? 0)}%` }}
            />
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              {isAdmin ? 'Presupuesto Corporativo' : 'Puntuación 360° Media'}
            </span>
            {isAdmin ? <DollarSign size={20} color="var(--accent)" /> : <Award size={20} color="var(--accent)" />}
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {isAdmin
              ? `€${(overview?.total_budget || 0).toLocaleString('es-ES')}`
              : `${overview?.avg_performance_score || 0} / 5.0`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isAdmin
              ? `Nota 360° global: ${overview?.avg_performance_score || 0} / 5.0`
              : `Presupuesto de área: €${(deptFocus?.budget || 0).toLocaleString('es-ES')}`}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              {isAdmin ? 'OKRs Globales Completados' : 'OKRs de Mi Departamento'}
            </span>
            <CheckCircle2 size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0' }}>
            {isAdmin
              ? `${overview?.completed_okrs || 0} / ${overview?.total_okrs || 0}`
              : `${deptFocus?.completed_okrs ?? overview?.completed_okrs ?? 0} / ${deptFocus?.total_okrs ?? overview?.total_okrs ?? 0}`}
          </div>
          {(isAdmin ? overview?.at_risk_okrs : deptFocus?.at_risk_okrs) > 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>
              ⚠️ {isAdmin ? overview.at_risk_okrs : deptFocus.at_risk_okrs} OKR(s) requieren atención
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }}>
              ✓ 0 OKRs en Riesgo en tu área
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DIFERENCIADA: Si es ADMIN muestra Matriz Financiera Multi-Departamento; si es MANAGER muestra Supervisión Directa de Su Equipo */}
      {isAdmin ? (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} color="var(--secondary)" />
                Matriz Ejecutiva Multi-Departamento &amp; Eficiencia Presupuestaria
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Control financiero global, inversión por colaborador y cumplimiento estratégico por unidad de negocio
              </p>
            </div>
            {setActiveTab && (
              <button className="btn btn-secondary" onClick={() => setActiveTab('admin')} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
                <Settings size={15} /> Ir a Configuración Admin
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Departamento</th>
                  <th>Plantilla</th>
                  <th>Presupuesto Anual</th>
                  <th>Inversión / Miembro</th>
                  <th>Avance OKR</th>
                  <th>Estado Operativo</th>
                </tr>
              </thead>
              <tbody>
                {(departments || []).map((dept) => {
                  const perMember = dept.member_count > 0 ? Math.round(dept.budget / dept.member_count) : 0;
                  return (
                    <tr key={dept.id}>
                      <td>
                        <div style={{ fontWeight: '700' }}>{dept.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dept.description}</div>
                      </td>
                      <td style={{ fontWeight: '700' }}>{dept.member_count} integrante(s)</td>
                      <td style={{ fontWeight: '700', color: 'var(--accent)' }}>€{(dept.budget || 0).toLocaleString('es-ES')}</td>
                      <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>€{perMember.toLocaleString('es-ES')} / persona</td>
                      <td style={{ minWidth: '150px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                          <span>{dept.okr_count} OKR(s)</span>
                          <strong style={{ color: 'var(--secondary)' }}>{dept.avg_progress}%</strong>
                        </div>
                        <div className="progress-bar-container" style={{ marginTop: 0 }}>
                          <div className="progress-bar-fill" style={{ width: `${dept.avg_progress}%` }} />
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${dept.at_risk_count > 0 ? 'badge-status-at_risk' : 'badge-status-completed'}`}>
                          {dept.at_risk_count > 0 ? `${dept.at_risk_count} en Riesgo` : 'Óptimo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        my_department && my_department.members && (
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="var(--secondary)" />
                  Supervisión Directa de Integrantes — {my_department.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Monitoreo de carga de objetivos, desempeño 360° y estado operativo de cada miembro del equipo
                </p>
              </div>
              {setActiveTab && (
                <button className="btn btn-secondary" onClick={() => setActiveTab('okrs')} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
                  <Target size={15} /> Asignar / Gestionar OKRs del Equipo
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Integrante</th>
                    <th>Cargo Técnico</th>
                    <th>OKRs Asignados</th>
                    <th>Progreso Individual</th>
                    <th>Evaluación 360°</th>
                    <th>Estado de Carga</th>
                  </tr>
                </thead>
                <tbody>
                  {my_department.members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div style={{ fontWeight: '700' }}>{member.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{member.username} ({member.role_display})</div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{member.job_title}</td>
                      <td style={{ fontWeight: '700' }}>{member.okr_count} objetivo(s)</td>
                      <td style={{ minWidth: '160px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                          <span>Avance</span>
                          <strong style={{ color: 'var(--secondary)' }}>{member.avg_progress}%</strong>
                        </div>
                        <div className="progress-bar-container" style={{ marginTop: 0 }}>
                          <div className="progress-bar-fill" style={{ width: `${member.avg_progress}%` }} />
                        </div>
                      </td>
                      <td>
                        {member.avg_review_score ? (
                          <span style={{ fontWeight: '700', color: 'var(--accent)' }}>★ {member.avg_review_score} / 5.0</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin evaluar</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${member.workload_status === 'Óptimo' ? 'badge-status-completed' : 'badge-status-at_risk'}`}>
                          {member.workload_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Analytics Chart & Department Breakdown */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="var(--primary)" />
            {isAdmin ? 'Rendimiento y Presupuesto por Departamento' : 'Comparativa de Departamentos de la Empresa'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {departments && departments.map((dept) => (
              <div key={dept.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: '600' }}>
                    {dept.name}
                    {my_department?.id === dept.id && !isAdmin && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--secondary)' }}>(Tu Equipo)</span>
                    )}
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{dept.avg_progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${dept.avg_progress}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>{dept.member_count} Miembros • {dept.okr_count} Objetivos</span>
                  {isAdmin && <span>Presupuesto: €{(dept.budget || 0).toLocaleString('es-ES')}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--secondary)" />
            {isAdmin ? 'Estado Global de Objetivos OKR' : `Estado de OKRs (${deptFocus?.name || 'Departamento'})`}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '80%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ fontWeight: '600' }}>Completados</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                {isAdmin ? (overview?.completed_okrs || 0) : (deptFocus?.completed_okrs ?? overview?.completed_okrs ?? 0)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span style={{ fontWeight: '600' }}>En Progreso</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                {isAdmin ? (overview?.in_progress_okrs || 0) : (deptFocus?.in_progress_okrs ?? overview?.in_progress_okrs ?? 0)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)' }} />
                <span style={{ fontWeight: '600' }}>En Riesgo</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                {isAdmin ? (overview?.at_risk_okrs || 0) : (deptFocus?.at_risk_okrs ?? overview?.at_risk_okrs ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
