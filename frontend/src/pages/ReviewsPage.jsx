import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Plus, Star, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';

const ReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [evaluateeId, setEvaluateeId] = useState('');
  const [period, setPeriod] = useState('Anual 2026');
  const [leadershipScore, setLeadershipScore] = useState(4);
  const [teamworkScore, setTeamworkScore] = useState(4);
  const [technicalScore, setTechnicalScore] = useState(4);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, userRes] = await Promise.all([
        api.get('/reviews/'),
        api.get('/users/')
      ]);
      setReviews(revRes.data.results || revRes.data);
      const userList = userRes.data.results || userRes.data;
      setUsers(userList.filter(u => u.id !== user.id));
      if (userList.length > 0) setEvaluateeId(userList[0].id);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews/', {
        evaluatee: evaluateeId,
        period: period,
        leadership_score: parseInt(leadershipScore),
        teamwork_score: parseInt(teamworkScore),
        technical_score: parseInt(technicalScore),
        strengths: strengths,
        areas_for_improvement: improvements,
        status: 'APPROVED'
      });
      setShowModal(false);
      setStrengths('');
      setImprovements('');
      fetchData();
    } catch (err) {
      alert('Error al guardar la evaluación');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Evaluaciones de Desempeño 360°</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Retroalimentación estructurada, competencias clave y scoring profesional
          </p>
        </div>
        {user.role !== 'EMPLOYEE' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Nueva Evaluación 360°
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando evaluaciones desde el backend...
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Award size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No hay evaluaciones de desempeño registradas</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            Las evaluaciones 360° realizadas por managers aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="badge badge-manager" style={{ marginBottom: '0.4rem' }}>
                    {rev.period}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '0.2rem' }}>
                    {rev.evaluatee_detail?.first_name || rev.evaluatee_detail?.username} {rev.evaluatee_detail?.last_name || ''}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Evaluador: <strong>{rev.evaluator_detail?.username}</strong> ({rev.evaluator_detail?.role_display})
                  </div>
                </div>

                <div style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.15)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary)' }}>
                    {rev.overall_score}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 5.0 Global</div>
                </div>
              </div>

              {/* Scoring breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', margin: '1rem 0', background: 'rgba(15, 23, 42, 0.6)', padding: '0.8rem', borderRadius: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Liderazgo</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fcd34d' }}>{rev.leadership_score} ⭐</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trabajo Equipo</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#6ee7b7' }}>{rev.teamwork_score} ⭐</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Competencia Tec.</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#818cf8' }}>{rev.technical_score} ⭐</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', marginTop: '0.8rem' }}>
                <strong style={{ color: 'var(--accent)' }}>Fortalezas:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{rev.strengths || 'N/A'}</p>
              </div>

              <div style={{ fontSize: '0.85rem', marginTop: '0.6rem' }}>
                <strong style={{ color: 'var(--warning)' }}>Oportunidades de Mejora:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{rev.areas_for_improvement || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Evaluación */}
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
          <div className="glass-card" style={{ maxWidth: '560px', width: '90%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.2rem' }}>
              Nueva Evaluación de Desempeño 360°
            </h3>

            <form onSubmit={handleCreateReview}>
              <div className="form-group">
                <label>Empleado a Evaluar</label>
                <select
                  className="form-control"
                  value={evaluateeId}
                  onChange={(e) => setEvaluateeId(e.target.value)}
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.first_name || u.username} {u.last_name || ''} ({u.job_title || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Periodo de Evaluación</label>
                <input
                  type="text"
                  className="form-control"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  required
                />
              </div>

              <div className="grid-3" style={{ gap: '0.8rem' }}>
                <div className="form-group">
                  <label>Liderazgo (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="form-control"
                    value={leadershipScore}
                    onChange={(e) => setLeadershipScore(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Trabajo Equipo (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="form-control"
                    value={teamworkScore}
                    onChange={(e) => setTeamworkScore(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Técnico (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="form-control"
                    value={technicalScore}
                    onChange={(e) => setTechnicalScore(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fortalezas Principales</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Habilidades destacadas y logros..."
                />
              </div>

              <div className="form-group">
                <label>Áreas de Mejora</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Aspectos a desarrollar en el siguiente ciclo..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar y Aprobar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
