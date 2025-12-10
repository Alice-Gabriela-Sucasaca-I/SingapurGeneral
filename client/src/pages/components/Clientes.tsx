import React, { useEffect, useState } from 'react';
import { clienteService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import { exportToExcel } from '../../utils/excelExport';
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
  const [errors, setErrors] = useState<any>({});

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

  const validateDNI = (dni: string): boolean => {
    if (dni.length !== 8) return false;
    return /^\d{8}$/.test(dni);
  };

  const validateRUC = (ruc: string): boolean => {
    if (ruc.length !== 11) return false;
    if (!ruc.startsWith('10') && !ruc.startsWith('20')) return false;
    return /^\d{11}$/.test(ruc);
  };

  const validateCelular = (celular: string): boolean => {
    if (celular.length !== 9) return false;
    if (!celular.startsWith('9')) return false;
    return /^\d{9}$/.test(celular);
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (formData.tipo === 'persona') {
      if (!validateDNI(formData.dni)) {
        newErrors.dni = 'DNI debe tener exactamente 8 dígitos';
      }
      if (!validateCelular(formData.nro_celular)) {
        newErrors.nro_celular = 'Celular debe tener 9 dígitos y empezar con 9';
      }
    } else {
      if (!validateRUC(formData.ruc)) {
        newErrors.ruc = 'RUC debe tener 11 dígitos y empezar con 10 o 20';
      }
      if (!validateCelular(formData.telefono)) {
        newErrors.telefono = 'Teléfono debe tener 9 dígitos y empezar con 9';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
    setErrors({});
    setEditing(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
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
      key: 'documento',
      label: 'DNI/RUC',
      render: (value: any, row: any) => row.dni || row.ruc || '-',
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-success" 
            onClick={() => exportToExcel(clientes, 'clientes')}
          >
            ⬇ Descargar Excel
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            + Nuevo Cliente
          </button>
        </div>
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
              onChange={(e) => {
                setFormData({ ...formData, tipo: e.target.value });
                setErrors({});
              }}
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
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
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
                    onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido Materno</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.apellido_materno}
                    onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
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
                    onChange={(e) => handleInputChange('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                    required
                    maxLength={8}
                    placeholder="8 dígitos"
                    style={{ borderColor: errors.dni ? 'var(--error)' : undefined }}
                  />
                  {errors.dni && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.dni}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Celular</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nro_celular}
                    onChange={(e) => handleInputChange('nro_celular', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    required
                    maxLength={9}
                    placeholder="9 dígitos (ej: 987654321)"
                    style={{ borderColor: errors.nro_celular ? 'var(--error)' : undefined }}
                  />
                  {errors.nro_celular && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.nro_celular}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
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
                  onChange={(e) => handleInputChange('razon_social', e.target.value)}
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
                    onChange={(e) => handleInputChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    required
                    maxLength={11}
                    placeholder="11 dígitos (ej: 20123456789)"
                    style={{ borderColor: errors.ruc ? 'var(--error)' : undefined }}
                  />
                  {errors.ruc && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.ruc}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    required
                    maxLength={9}
                    placeholder="9 dígitos (ej: 987654321)"
                    style={{ borderColor: errors.telefono ? 'var(--error)' : undefined }}
                  />
                  {errors.telefono && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.telefono}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion_empresa}
                  onChange={(e) => handleInputChange('direccion_empresa', e.target.value)}
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