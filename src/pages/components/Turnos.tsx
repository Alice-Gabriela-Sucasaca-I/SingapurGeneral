import React, { useEffect, useState } from 'react';
import { turnoService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';

const Turnos: React.FC = () => {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    hora_entrada: '',
    hora_salida: '',
  });

  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = async () => {
    try {
      const response = await turnoService.getAll();
      setTurnos(response.data);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await turnoService.update(editing.id_turno, formData);
      } else {
        await turnoService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      loadTurnos();
    } catch (error) {
      console.error('Error al guardar turno:', error);
      alert('Error al guardar turno');
    }
  };

  const handleEdit = (turno: any) => {
    setEditing(turno);
    setFormData({
      hora_entrada: turno.hora_entrada,
      hora_salida: turno.hora_salida,
    });
    setModalOpen(true);
  };

  const handleDelete = async (turno: any) => {
    if (window.confirm('¿Estás seguro de eliminar este turno?')) {
      try {
        await turnoService.delete(turno.id_turno);
        loadTurnos();
      } catch (error) {
        console.error('Error al eliminar turno:', error);
        alert('Error al eliminar turno');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      hora_entrada: '',
      hora_salida: '',
    });
    setEditing(null);
  };

  const columns = [
    { key: 'id_turno', label: 'ID' },
    { key: 'hora_entrada', label: 'Hora de Entrada' },
    { key: 'hora_salida', label: 'Hora de Salida' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Turnos</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nuevo Turno
        </button>
      </div>
      <Table
        columns={columns}
        data={turnos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editing ? 'Editar Turno' : 'Nuevo Turno'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hora de Entrada</label>
              <input
                type="time"
                className="form-input"
                value={formData.hora_entrada}
                onChange={(e) => setFormData({ ...formData, hora_entrada: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hora de Salida</label>
              <input
                type="time"
                className="form-input"
                value={formData.hora_salida}
                onChange={(e) => setFormData({ ...formData, hora_salida: e.target.value })}
                required
              />
            </div>
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

export default Turnos;

