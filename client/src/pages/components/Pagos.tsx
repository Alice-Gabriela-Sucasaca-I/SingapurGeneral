import React, { useEffect, useState } from 'react';
import { pagoService, ordenService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';

const Pagos: React.FC = () => {
  const [pagos, setPagos] = useState<any[]>([]);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_orden: '',
    total_pago: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_pago: new Date().toTimeString().split(' ')[0].slice(0, 5),
    tipo_pago: 'efectivo',
    detalle: {
      cambio: '',
      numero: '',
      entidad: '',
      imagen_qr: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pagosRes, ordenesRes] = await Promise.all([
        pagoService.getAll(),
        ordenService.getAll(),
      ]);
      setPagos(pagosRes.data);
      setOrdenes(ordenesRes.data.filter((o: any) => o.estado !== 'pagado'));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pagoService.create(formData);
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al guardar pago:', error);
      alert('Error al guardar pago');
    }
  };

  const handleDelete = async (pago: any) => {
    if (window.confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await pagoService.delete(pago.id_pago);
        loadData();
      } catch (error) {
        console.error('Error al eliminar pago:', error);
        alert('Error al eliminar pago');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_orden: '',
      total_pago: '',
      fecha: new Date().toISOString().split('T')[0],
      hora_pago: new Date().toTimeString().split(' ')[0].slice(0, 5),
      tipo_pago: 'efectivo',
      detalle: {
        cambio: '',
        numero: '',
        entidad: '',
        imagen_qr: '',
      },
    });
  };

  const handleOrdenChange = (ordenId: string) => {
    const orden = ordenes.find((o: any) => o.id_orden === parseInt(ordenId));
    if (orden) {
      setFormData({ ...formData, id_orden: ordenId, total_pago: orden.total });
    }
  };

  const columns = [
    { key: 'id_pago', label: 'ID' },
    { key: 'id_orden', label: 'ID Orden' },
    {
      key: 'total_pago',
      label: 'Total',
      render: (value: any) => `S/ ${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: any) => new Date(value).toLocaleDateString('es-PE'),
    },
    { key: 'hora_pago', label: 'Hora' },
    {
      key: 'tipo_pago',
      label: 'Tipo de Pago',
      render: (value: any) => {
        const tipoConfig: any = {
          tarjeta: { color: 'var(--primary)', bg: 'rgba(6, 68, 168, 0.2)' },
          qr: { color: 'var(--secondary)', bg: 'rgba(11, 92, 203, 0.2)' },
          efectivo: { color: 'var(--success)', bg: 'rgba(27, 142, 97, 0.2)' },
        };
        const config = tipoConfig[value] || tipoConfig.efectivo;
        return (
          <span
            style={{
              color: config.color,
              backgroundColor: config.bg,
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {value.toUpperCase()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Pagos</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nuevo Pago
        </button>
      </div>
      <Table
        columns={columns}
        data={pagos}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title="Nuevo Pago"
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Orden</label>
            <select
              className="form-select"
              value={formData.id_orden}
              onChange={(e) => handleOrdenChange(e.target.value)}
              required
            >
              <option value="">Seleccionar orden</option>
              {ordenes.map((orden) => (
                <option key={orden.id_orden} value={orden.id_orden}>
                  Orden #{orden.id_orden} - Mesa {orden.numero_mesa} - S/ {parseFloat(orden.total).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total a Pagar</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.total_pago}
                onChange={(e) => setFormData({ ...formData, total_pago: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Pago</label>
              <select
                className="form-select"
                value={formData.tipo_pago}
                onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })}
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="qr">QR</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input
                type="time"
                className="form-input"
                value={formData.hora_pago}
                onChange={(e) => setFormData({ ...formData, hora_pago: e.target.value })}
                required
              />
            </div>
          </div>
          {formData.tipo_pago === 'efectivo' && (
            <div className="form-group">
              <label className="form-label">Cambio</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.detalle.cambio}
                onChange={(e) => setFormData({
                  ...formData,
                  detalle: { ...formData.detalle, cambio: e.target.value },
                })}
                min="0"
              />
            </div>
          )}
          {formData.tipo_pago === 'tarjeta' && (
            <>
              <div className="form-group">
                <label className="form-label">Número de Tarjeta</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.detalle.numero}
                  onChange={(e) => setFormData({
                    ...formData,
                    detalle: { ...formData.detalle, numero: e.target.value },
                  })}
                  required
                  maxLength={16}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Entidad</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.detalle.entidad}
                  onChange={(e) => setFormData({
                    ...formData,
                    detalle: { ...formData.detalle, entidad: e.target.value },
                  })}
                  required
                />
              </div>
            </>
          )}
          {formData.tipo_pago === 'qr' && (
            <div className="form-group">
              <label className="form-label">URL de Imagen QR</label>
              <input
                type="text"
                className="form-input"
                value={formData.detalle.imagen_qr}
                onChange={(e) => setFormData({
                  ...formData,
                  detalle: { ...formData.detalle, imagen_qr: e.target.value },
                })}
                required
              />
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Pago
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pagos;

