import React, { useEffect, useState } from 'react';
import { empleadoService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';

const Empleados: React.FC = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    cargo: '',
    sueldo: '',
    nro_celular: '',
  });

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      const response = await empleadoService.getAll();
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await empleadoService.update(editing.id_empleado, formData);
      } else {
        await empleadoService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      loadEmpleados();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      alert('Error al guardar empleado');
    }
  };

  const handleEdit = (empleado: any) => {
    setEditing(empleado);
    setFormData({
      nombre: empleado.nombre,
      apellido_paterno: empleado.apellido_paterno,
      apellido_materno: empleado.apellido_materno,
      cargo: empleado.cargo,
      sueldo: empleado.sueldo,
      nro_celular: empleado.nro_celular,
    });
    setModalOpen(true);
  };

  const handleDelete = async (empleado: any) => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
      try {
        await empleadoService.delete(empleado.id_empleado);
        loadEmpleados();
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        alert('Error al eliminar empleado');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      cargo: '',
      sueldo: '',
      nro_celular: '',
    });
    setEditing(null);
  };

  const columns = [
    { key: 'id_empleado', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido_paterno', label: 'Apellido Paterno' },
    { key: 'apellido_materno', label: 'Apellido Materno' },
    { key: 'cargo', label: 'Cargo' },
    {
      key: 'sueldo',
      label: 'Sueldo',
      render: (value: any) => `S/ ${parseFloat(value).toFixed(2)}`,
    },
    { key: 'nro_celular', label: 'Celular' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Empleados</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nuevo Empleado
        </button>
      </div>
      <Table
        columns={columns}
        data={empleados}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editing ? 'Editar Empleado' : 'Nuevo Empleado'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Apellido Paterno</label>
              <input
                type="text"
                className="form-input"
                value={formData.apellido_paterno}
                onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido Materno</label>
              <input
                type="text"
                className="form-input"
                value={formData.apellido_materno}
                onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cargo</label>
            <input
              type="text"
              className="form-input"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sueldo</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.sueldo}
                onChange={(e) => setFormData({ ...formData, sueldo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Número de Celular</label>
              <input
                type="text"
                className="form-input"
                value={formData.nro_celular}
                onChange={(e) => setFormData({ ...formData, nro_celular: e.target.value })}
                required
                maxLength={9}
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

export default Empleados;

