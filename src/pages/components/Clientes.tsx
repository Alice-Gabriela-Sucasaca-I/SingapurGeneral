import React, { useEffect, useState } from 'react';
import { clienteService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    tipo: 'persona',
    // Persona
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    nro_celular: '',
    direccion: '',
    dni: '',
    // Empresa
    razon_social: '',
    direccion_empresa: '',
    telefono: '',
    ruc: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clienteService.getAll();
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = { tipo: formData.tipo };
      if (formData.tipo === 'persona') {
        Object.assign(data, {
          nombre: formData.nombre,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno,
          nro_celular: formData.nro_celular,
          direccion: formData.direccion,
          dni: formData.dni,
        });
      } else {
        Object.assign(data, {
          razon_social: formData.razon_social,
          direccion: formData.direccion_empresa,
          telefono: formData.telefono,
          ruc: formData.ruc,
        });
      }
      if (editing) {
        await clienteService.update(editing.id_cliente, data);
      } else {
        await clienteService.create(data);
      }
      setModalOpen(false);
      resetForm();
      loadClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar cliente');
    }
  };

  const handleEdit = (cliente: any) => {
    setEditing(cliente);
    setFormData({
      tipo: cliente.tipo,
      nombre: cliente.nombre || '',
      apellido_paterno: cliente.apellido_paterno || '',
      apellido_materno: cliente.apellido_materno || '',
      nro_celular: cliente.nro_celular || '',
      direccion: cliente.direccion || '',
      dni: cliente.dni || '',
      razon_social: cliente.razon_social || '',
      direccion_empresa: cliente.direccion_empresa || '',
      telefono: cliente.telefono || '',
      ruc: cliente.ruc || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (cliente: any) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clienteService.delete(cliente.id_cliente);
        loadClientes();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'persona',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      nro_celular: '',
      direccion: '',
      dni: '',
      razon_social: '',
      direccion_empresa: '',
      telefono: '',
      ruc: '',
    });
    setEditing(null);
  };

  const columns = [
    { key: 'id_cliente', label: 'ID' },
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'nombre',
      label: 'Nombre / Razón Social',
      render: (value: any, row: any) => {
        const nombre = row.tipo === 'persona' 
          ? `${row.nombre || ''} ${row.apellido_paterno || ''} ${row.apellido_materno || ''}`.trim()
          : row.razon_social || '-';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                backgroundColor: row.tipo === 'persona' 
                  ? 'rgba(6, 68, 168, 0.2)' 
                  : 'rgba(11, 92, 203, 0.2)',
                color: row.tipo === 'persona' ? 'var(--primary)' : 'var(--secondary)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '500',
              }}
            >
              {row.tipo === 'persona' ? 'PERSONA' : 'EMPRESA'}
            </span>
            <span>{nombre}</span>
          </div>
        );
      },
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (value: any, row: any) => row.nro_celular || row.telefono || '-',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Clientes</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nuevo Cliente
        </button>
      </div>
      <Table
        columns={columns}
        data={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Tipo de Cliente</label>
            <select
              className="form-select"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              <option value="persona">Persona</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>
          {formData.tipo === 'persona' ? (
            <>
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
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">DNI</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    required
                    maxLength={8}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Celular</label>
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
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Razón Social</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">RUC</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    required
                    maxLength={11}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                    maxLength={9}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion_empresa}
                  onChange={(e) => setFormData({ ...formData, direccion_empresa: e.target.value })}
                  required
                />
              </div>
            </>
          )}
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

export default Clientes;

