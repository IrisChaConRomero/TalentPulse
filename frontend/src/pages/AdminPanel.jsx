import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield, Users, Building, DollarSign, Plus, UserCheck,
  Briefcase, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Modal Nuevo Usuario
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: '',
    job_title: 'Especialista'
  });

  // Modal Nuevo Departamento
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    description: '',
    budget: 50000
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes, dashRes] = await Promise.all([
        api.get('/users/'),
        api.get('/departments/'),
        api.get('/analytics/dashboard/')
      ]);
      setUsers(usersRes.data.results || usersRes.data);
      setDepartments(deptsRes.data.results || deptsRes.data);
      setAuditLogs(dashRes.data.recent_audit || []);
    } catch (err) {
      console.error('Error al cargar datos de administración:', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/`, { role: newRole });
      notify('✓ Rol de usuario actualizado correctamente');
      fetchAdminData();
    } catch (err) {
      alert('No se pudo actualizar el rol del usuario.');
    }
  };

  const handleDepartmentChange = async (userId, deptId) => {
    try {
      await api.patch(`/users/${userId}/`, { department: deptId || null });
      notify('✓ Departamento asignado correctamente');
      fetchAdminData();
    } catch (err) {
      alert('No se pudo actualizar el departamento.');
    }
  };

  const handleBudgetUpdate = async (deptId, newBudget) => {
    try {
      await api.patch(`/departments/${deptId}/`, { budget: parseFloat(newBudget) || 0 });
      notify('✓ Presupuesto departamental actualizado');
      fetchAdminData();
    } catch (err) {
      alert('Error al actualizar presupuesto.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', {
        ...newUser,
        department: newUser.department ? parseInt(newUser.department, 10) : null
      });
      setShowUserModal(false);
      setNewUser({
        username: '', first_name: '', last_name: '', email: '',
        password: '', role: 'EMPLOYEE', department: '', job_title: 'Especialista'
      });
      notify('✓ Nuevo usuario corporativo creado con éxito');
      fetchAdminData();
    } catch (err) {
      alert('Error al crear usuario. Verifica que el nombre de usuario no exista.');
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments/', {
        name: newDept.name,
        description: newDept.description,
        budget: parseFloat(newDept.budget) || 0
      });
      setShowDeptModal(false);
      setNewDept({ name: '', description: '', budget: 50000 });
      notify('✓ Nuevo departamento registrado');
      fetchAdminData();
    } catch (err) {
      alert('Error al crear el departamento.');
    }
  };

  const totalBudget = departments.reduce((acc, d) => acc + parseFloat(d.budget || 0), 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Cargando consola de Configuración y Administración Global...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label">
            <span className="status-dot" />
            <span>Exclusivo ADMIN / CTO • Configuración del Sistema &amp; Control RBAC</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Panel de <span className="gradient-text">Configuración Admin</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
            Configuración centralizada de usuarios, roles, permisos, departamentos, presupuestos y auditoría global en <strong className="notranslate" translate="no">TalentPulse</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowDeptModal(true)}>
            <Building size={16} />
            Nuevo Departamento
          </button>
          <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
            <Plus size={16} />
            Alta de Usuario
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#6ee7b7',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          {feedbackMsg}
        </div>
      )}

      {/* Resumen de Gobernanza */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Usuarios en Plataforma
            </span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0' }}>{users.length}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {users.filter(u => u.role === 'ADMIN').length} Admin • {users.filter(u => u.role === 'MANAGER').length} Managers • {users.filter(u => u.role === 'EMPLOYEE').length} Empleados
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Presupuesto Anual Asignado
            </span>
            <DollarSign size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--accent)' }}>
            €{totalBudget.toLocaleString('es-ES')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Distribuido en {departments.length} departamentos estratégicos
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Seguridad & Control RBAC
            </span>
            <UserCheck size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0' }}>Activo</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
            ✓ Permisos jerárquicos diferenciados por rol
          </div>
        </div>
      </div>

      {/* Gestión de Usuarios y Permisos RBAC */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--primary)" /> Directorio de Usuarios & Asignación de Roles (RBAC en Vivo)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Como Administrador puedes promover empleados a Manager, reasignar miembros de departamento o incorporar talento.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cargo</th>
                <th>Rol del Sistema (RBAC)</th>
                <th>Departamento Asignado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: '700' }}>{u.first_name} {u.last_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username} • {u.email}</div>
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Briefcase size={14} color="var(--secondary)" />
                      {u.job_title || 'Especialista'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: 'auto', minWidth: '170px' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="ADMIN">ADMIN / CTO</option>
                      <option value="MANAGER">MANAGER / Supervisor</option>
                      <option value="EMPLOYEE">EMPLEADO</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: 'auto', minWidth: '190px' }}
                      value={u.department || ''}
                      onChange={(e) => handleDepartmentChange(u.id, e.target.value)}
                    >
                      <option value="">Sin Departamento</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className="badge badge-status-completed">Activo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gestión de Departamentos y Auditoría */}
      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="var(--secondary)" /> Control de Presupuestos por Departamento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {departments.map((dept) => (
              <div key={dept.id} style={{
                background: 'rgba(15, 23, 42, 0.55)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '1rem' }}>{dept.name}</span>
                  <span className="badge badge-manager">{dept.member_count} miembros</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                  {dept.description || 'Departamento corporativo'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Presupuesto (€):</span>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                    defaultValue={dept.budget}
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) !== parseFloat(dept.budget)) {
                        handleBudgetUpdate(dept.id, e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent)" /> Registro de Auditoría Global
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Últimas actualizaciones de objetivos estratégicos en toda la empresa:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {auditLogs.map((log, index) => (
              <div key={index} style={{
                background: 'rgba(15, 23, 42, 0.55)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                borderLeft: '3px solid var(--primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{log.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Responsable: <strong>{log.actor}</strong> • Dept: {log.department}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', color: 'var(--secondary)' }}>{log.progress}%</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Alta de Usuario */}
      {showUserModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '92%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.2rem' }}>
              Alta de Nuevo Usuario Corporativo
            </h3>
            <form onSubmit={handleCreateUser}>
              <div className="grid-2" style={{ gap: '0.8rem' }}>
                <div className="form-group">
                  <label>Usuario (Login)</label>
                  <input
                    type="text" className="form-control" required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="ej. laura_ux"
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña Inicial</label>
                  <input
                    type="password" className="form-control" required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '0.8rem' }}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text" className="form-control" required
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input
                    type="text" className="form-control" required
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Corporativo</label>
                <input
                  type="email" className="form-control" required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@talentpulse.io"
                />
              </div>

              <div className="grid-2" style={{ gap: '0.8rem' }}>
                <div className="form-group">
                  <label>Rol RBAC</label>
                  <select
                    className="form-control"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="MANAGER">Manager / Supervisor</option>
                    <option value="ADMIN">Administrador / CTO</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Departamento</label>
                  <select
                    className="form-control"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Cargo / Puesto</label>
                <input
                  type="text" className="form-control"
                  value={newUser.job_title}
                  onChange={(e) => setNewUser({ ...newUser, job_title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Departamento */}
      {showDeptModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '92%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.2rem' }}>
              Crear Nuevo Departamento
            </h3>
            <form onSubmit={handleCreateDept}>
              <div className="form-group">
                <label>Nombre del Departamento</label>
                <input
                  type="text" className="form-control" required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="Ej. Producto & Diseño UX"
                />
              </div>
              <div className="form-group">
                <label>Descripción de Misión</label>
                <textarea
                  className="form-control" rows="3"
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Presupuesto Anual Asignado (€)</label>
                <input
                  type="number" className="form-control" required
                  value={newDept.budget}
                  onChange={(e) => setNewDept({ ...newDept, budget: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Departamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
