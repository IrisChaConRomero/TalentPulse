import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, CheckCircle2, AlertCircle, Plus, Sliders, ArrowUpRight } from 'lucide-react';

const EmployeeDashboard = () => {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOkrTitle, setNewOkrTitle] = useState('');
  const [newOkrDesc, setNewOkrDesc] = useState('');
  const [newOkrQuarter, setNewOkrQuarter] = useState('Q3-2026');

  useEffect(() => {
    fetchOkrs();
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

  const handleCreateOkr = async (e) => {
    e.preventDefault();
    try {
      await api.post('/okrs/', {
        title: newOkrTitle,
        description: newOkrDesc,
        quarter: newOkrQuarter,
      });
      setShowModal(false);
      setNewOkrTitle('');
      setNewOkrDesc('');
      fetchOkrs();
    } catch (err) {
      alert('Error al crear el OKR');
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Gestión de Objetivos (OKRs)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitoreo en tiempo real e integración directa con la API Django
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nuevo Objetivo OKR
        </button>
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
            Comienza creando tu primer objetivo trimestral.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Crear Mi Primer OKR
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {okrs.map((okr) => (
            <div key={okr.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary)' }}>
                      [{okr.quarter}]
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{okr.title}</h3>
                    {getStatusBadge(okr.status)}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {okr.description || 'Sin descripción adicional.'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {okr.progress}%
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progreso Global</div>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${okr.progress}%` }} />
              </div>

              {okr.key_results && okr.key_results.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sliders size={16} /> Resultados Clave (Key Results - Interactivo):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {okr.key_results.map((kr) => (
                      <div key={kr.id} style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
              Crear Nuevo Objetivo OKR
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
    </div>
  );
};

export default EmployeeDashboard;
