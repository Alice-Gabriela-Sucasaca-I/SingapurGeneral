import React, { useEffect, useState } from 'react';
import { mesaService } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';
import '../styles/Mesas.css';

const Mesas: React.FC = () => {
  const [mesas, setMesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    numero: '',
    capacidad: '',
    disponibilidad: true,
  });

  useEffect(() => {
    loadMesas();
  }, []);

  const loadMesas = async () => {
    try {
      const response = await mesaService.getAll();
      setMesas(response.data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await mesaService.update(editing.id_mesa, formData);
      } else {
        await mesaService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      loadMesas();
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      alert('Error al guardar mesa');
    }
  };

  const handleEdit = (mesa: any) => {
    setEditing(mesa);
    setFormData({
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      disponibilidad: mesa.disponibilidad,
    });
    setModalOpen(true);
  };

  const handleToggleDisponibilidad = async (mesa: any) => {
    try {
      await mesaService.update(mesa.id_mesa, {
        ...mesa,
        disponibilidad: !mesa.disponibilidad,
      });
      loadMesas();
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      alert('Error al actualizar mesa');
    }
  };

  const handleDelete = async (mesa: any) => {
    if (window.confirm('¿Estás seguro de eliminar esta mesa?')) {
      try {
        await mesaService.delete(mesa.id_mesa);
        loadMesas();
      } catch (error) {
        console.error('Error al eliminar mesa:', error);
        alert('Error al eliminar mesa');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      capacidad: '',
      disponibilidad: true,
    });
    setEditing(null);
  };

  const getMesaStatusColor = (disponibilidad: boolean) => {
    if (disponibilidad) {
      return 'var(--success)';
    }
    return 'var(--error)';
  };

  const getMesaStatusText = (disponibilidad: boolean) => {
    return disponibilidad ? 'Disponible' : 'Ocupada';
  };

  if (loading) {
    return <div className="loading">Cargando mesas...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Mesas</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nueva Mesa
        </button>
      </div>

      <div className="mesas-grid">
        {mesas.map((mesa) => (
          <div
            key={mesa.id_mesa}
            className={`mesa-card ${mesa.disponibilidad ? 'disponible' : 'ocupada'}`}
            onClick={() => handleEdit(mesa)}
          >
            <div className="mesa-icon">🪑</div>
            <div className="mesa-info">
              <h3 className="mesa-numero">Mesa {mesa.numero}</h3>
              <p className="mesa-capacidad">{mesa.capacidad} personas</p>
              <div
                className="mesa-status"
                style={{ color: getMesaStatusColor(mesa.disponibilidad) }}
              >
                {getMesaStatusText(mesa.disponibilidad)}
              </div>
            </div>
            <div className="mesa-actions">
              <button
                className="btn-mesa-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDisponibilidad(mesa);
                }}
                title={mesa.disponibilidad ? 'Marcar como ocupada' : 'Marcar como disponible'}
              >
                {mesa.disponibilidad ? '🔒' : '🔓'}
              </button>
              <button
                className="btn-mesa-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(mesa);
                }}
                title="Eliminar mesa"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editing ? 'Editar Mesa' : 'Nueva Mesa'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Número de Mesa</label>
              <input
                type="number"
                className="form-input"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Capacidad</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                required
                min="1"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Disponibilidad</label>
            <select
              className="form-select"
              value={formData.disponibilidad ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value === 'true' })}
            >
              <option value="true">Disponible</option>
              <option value="false">Ocupada</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Mesas;
