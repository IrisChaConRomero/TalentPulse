import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, EyeOff, User } from 'lucide-react';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fbRes, userRes] = await Promise.all([
        api.get('/feedback/'),
        api.get('/users/')
      ]);
      setFeedbacks(fbRes.data.results || fbRes.data);
      const list = userRes.data.results || userRes.data;
      const filtered = list.filter(u => u.id !== user.id);
      setUsers(filtered);
      if (filtered.length > 0) setReceiverId(filtered[0].id);
    } catch (err) {
      console.error('Error al cargar feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/feedback/', {
        receiver: receiverId,
        content: content,
        is_anonymous: isAnonymous
      });
      setContent('');
      setIsAnonymous(false);
      fetchData();
    } catch (err) {
      alert('Error al enviar el feedback');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Feedback Continuo & Reconocimientos</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Muro de agradecimientos y retroalimentación directa entre colaboradores
        </p>
      </div>

      <div className="grid-2">
        {/* Formulario Enviar Feedback */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} color="var(--primary)" /> Enviar Nuevo Feedback
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Para quién es el Feedback</label>
              <select
                className="form-control"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                required
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.first_name || u.username} {u.last_name || ''} ({u.job_title})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mensaje de Feedback o Reconocimiento</label>
              <textarea
                className="form-control"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe palabras de reconocimiento o sugerencias de mejora constructivas..."
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="anon" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <EyeOff size={14} /> Enviar como mensaje Anónimo
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Send size={16} /> Enviar Feedback
            </button>
          </form>
        </div>

        {/* Historial Feedbacks */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--secondary)" /> Mi Muro de Feedback
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando feedbacks...</div>
          ) : feedbacks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              Aún no hay mensajes de feedback recibidos o enviados.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {feedbacks.map((fb) => (
                <div key={fb.id} style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '1rem',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    <span>
                      De: <strong>{fb.sender_name}</strong> ➔ Para: <strong>{fb.receiver_name}</strong>
                    </span>
                    <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    "{fb.content}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
