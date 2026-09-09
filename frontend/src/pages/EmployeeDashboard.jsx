import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Target, CheckCircle2, AlertCircle, Plus, Sliders,
  User, Building
} from 'lucide-react';

const EmployeeDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [okrs, setOkrs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Nuevo OKR
  const [showModal, setShowModal] = useState(false);
  const [newOkrTitle, setNewOkrTitle] = useState('');
  const [newOkrDesc, setNewOkrDesc] = useState('');
  const [newOkrQuarter, setNewOkrQuarter] = useState('Q3-2026');
  const [newOkrOwner, setNewOkrOwner] = useState('');

  // Modal Nuevo Key Result
  const [activeOkrForKr, setActiveOkrForKr] = useState(null);
  const [krTitle, setKrTitle] = useState('');
  const [krTarget, setKrTarget] = useState(100);
  const [krUnit, setKrUnit] = useState('%');

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchOkrs();
    if (isManagerOrAdmin) {
      fetchUsers();
    }
  }, []);

  const fetchOkrs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/okrs/');
      setOkrs(res.data.results || res.data);
    } catch (err) {
      console.error('Error al cargar OKRs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      const allUsers = res.data.results || res.data;
      if (user?.role === 'MANAGER' && user?.department) {
        setUsersList(allUsers.filter((u) => u.department === user.department));
      } else {
        setUsersList(allUsers);
      }
    } catch (err) {
      console.error('Error al cargar lista de usuarios:', err);
    }
  };

  const handleCreateOkr = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newOkrTitle,
        description: newOkrDesc,
        quarter: newOkrQuarter,
      };
      if (isManagerOrAdmin && newOkrOwner) {
        payload.owner = parseInt(newOkrOwner, 10);
      }
      await api.post('/okrs/', payload);
      setShowModal(false);
      setNewOkrTitle('');
      setNewOkrDesc('');
      setNewOkrOwner('');
      fetchOkrs();
    } catch (err) {
      alert('Error al crear el OKR');
    }
  };

  const handleCreateKeyResult = async (e) => {
    e.preventDefault();
    if (!activeOkrForKr) return;
    try {
      await api.post('/key-results/', {
        okr: activeOkrForKr.id,
        title: krTitle,
        target_value: parseFloat(krTarget) || 100,
        current_value: 0,
        unit: krUnit || '%',
        weight: 1.0
      });
      setActiveOkrForKr(null);
      setKrTitle('');
      setKrTarget(100);
      setKrUnit('%');
      fetchOkrs();
    } catch (err) {
      alert('Error al añadir el Key Result');
    }
  };

  const handleUpdateKeyResult = async (krId, newValue) => {
    try {
      await api.patch(`/key-results/${krId}/`, {
        current_value: parseFloat(newValue)
      });
      fetchOkrs();
    } catch (err) {
      console.error('Error al actualizar el Key Result:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-status-completed"><CheckCircle2 size={12} /> Completado</span>;
      case 'AT_RISK':
        return <span className="badge badge-status-at_risk"><AlertCircle size={12} /> En Riesgo</span>;
      default:
        return <span className="badge badge-status-in_progress"><Target size={12} /> En Progreso</span>;
    }
  };

  const getScopeSubtitle = () => {
    if (user?.role === 'ADMIN') {
      return 'Vista Global Corporativa: Supervisión y edición de todos los OKRs de la organización';
    }
    if (user?.role === 'MANAGER') {
      return `Vista de Supervisor (${user?.department_name || 'Mi Departamento'}): Gestión de tus OKRs y los de tu equipo directo`;
    }
    return 'Monitoreo personal en tiempo real e integración con el Mentor IA';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label">
            <span className="status-dot" />
            <span>Módulo Estratégico • Objetivos &amp; Key Results</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Gestión de Objetivos <span className="gradient-text">(OKRs)</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
            {getScopeSubtitle()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            {isManagerOrAdmin ? 'Asignar / Crear OKR' : 'Nuevo Objetivo OKR'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando OKRs desde el servidor backend...
        </div>
      ) : okrs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Target size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No hay OKRs registrados todavía</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            Comienza creando tu primer objetivo trimestral o genéralo con el Asistente IA.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Crear Mi Primer OKR
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {okrs.map((okr) => (
            <div key={okr.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary)' }}>
                      [{okr.quarter}]
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{okr.title}</h3>
                    {getStatusBadge(okr.status)}
                  </div>

                  {/* Metadatos de Propietario y Departamento */}
                  <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                    {okr.owner_detail && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={13} color="var(--primary)" />
                        Responsable: <strong>{okr.owner_detail.first_name || okr.owner_detail.username} {okr.owner_detail.last_name || ''}</strong>
                      </span>
                    )}
                    {okr.department_detail && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building size={13} color="var(--secondary)" />
                        Área: <strong>{okr.department_detail.name}</strong>
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {okr.description || 'Sin descripción adicional.'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {okr.progress}%
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progreso Global</div>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${okr.progress}%` }} />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sliders size={16} /> Resultados Clave (Key Results - Interactivo):
                  </h4>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => setActiveOkrForKr(okr)}
                  >
                    <Plus size={14} /> Añadir Key Result
                  </button>
                </div>

                {okr.key_results && okr.key_results.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {okr.key_results.map((kr) => (
                      <div key={kr.id} style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{kr.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Actual: {kr.current_value} / Meta: {kr.target_value} {kr.unit}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <input
                            type="range"
                            min="0"
                            max={kr.target_value}
                            step="1"
                            value={kr.current_value}
                            onChange={(e) => handleUpdateKeyResult(kr.id, e.target.value)}
                            style={{ cursor: 'pointer', width: '120px' }}
                          />
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            minWidth: '50px',
                            textAlign: 'right'
                          }}>
                            {Math.round(kr.completion_percentage)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                    Aún no hay Key Results asociados. Añade resultados medibles para calcular el avance automáticamente.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear OKR */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.2rem' }}>
              {isManagerOrAdmin ? 'Crear / Asignar Objetivo OKR' : 'Crear Nuevo Objetivo OKR'}
            </h3>

            <form onSubmit={handleCreateOkr}>
              <div className="form-group">
                <label>Título del Objetivo</label>
                <input
                  type="text"
                  className="form-control"
                  value={newOkrTitle}
                  onChange={(e) => setNewOkrTitle(e.target.value)}
                  placeholder="Ej. Reducir la latencia del API backend"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={newOkrDesc}
                  onChange={(e) => setNewOkrDesc(e.target.value)}
                  placeholder="Explica el contexto e impacto de este objetivo..."
                />
              </div>

              {isManagerOrAdmin && usersList.length > 0 && (
                <div className="form-group">
                  <label>Asignar Responsable ({user?.role === 'MANAGER' ? 'Mi Equipo' : 'Organización'})</label>
                  <select
                    className="form-control"
                    value={newOkrOwner}
                    onChange={(e) => setNewOkrOwner(e.target.value)}
                  >
                    <option value="">Asignar a mí mismo ({user?.first_name || user?.username})</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name} (@{u.username} - {u.job_title})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Trimestre / Periodo</label>
                <select
                  className="form-control"
                  value={newOkrQuarter}
                  onChange={(e) => setNewOkrQuarter(e.target.value)}
                >
                  <option value="Q3-2026">Q3 - 2026</option>
                  <option value="Q4-2026">Q4 - 2026</option>
                  <option value="Q1-2027">Q1 - 2027</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Añadir Key Result */}
      {activeOkrForKr && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '90%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Añadir Key Result Medible
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Objetivo: <strong>{activeOkrForKr.title}</strong>
            </p>

            <form onSubmit={handleCreateKeyResult}>
              <div className="form-group">
                <label>Métrica / Resultado Clave</label>
                <input
                  type="text"
                  className="form-control"
                  value={krTitle}
                  onChange={(e) => setKrTitle(e.target.value)}
                  placeholder="Ej. Alcanzar 90% de cobertura de tests E2E"
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '0.8rem' }}>
                <div className="form-group">
                  <label>Valor Meta (Target)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={krTarget}
                    onChange={(e) => setKrTarget(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unidad de Medida</label>
                  <input
                    type="text"
                    className="form-control"
                    value={krUnit}
                    onChange={(e) => setKrUnit(e.target.value)}
                    placeholder="%, ms, entregas, etc."
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveOkrForKr(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Añadir Key Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
