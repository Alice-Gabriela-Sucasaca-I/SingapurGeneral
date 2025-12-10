import React, { useEffect, useState } from 'react';
import { comprobanteService, pagoService, ordenService } from '../../services/api';
import { generarComprobantePDF } from '../../utils/pdfGenerator';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import { exportToExcel } from '../../utils/excelExport';
import '../styles/Page.css';

const Comprobantes: React.FC = () => {
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_pago: '',
    id_orden: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    monto_total: '',
    tipo_comprobante: 'boleta',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [comprobantesRes, pagosRes] = await Promise.all([
        comprobanteService.getAll(),
        pagoService.getAll(),
      ]);
      setComprobantes(comprobantesRes.data);
      setPagos(pagosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await comprobanteService.create(formData);
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al guardar comprobante:', error);
      alert('Error al guardar comprobante');
    }
  };

  const handleDelete = async (comprobante: any) => {
    if (window.confirm('¿Estás seguro de eliminar este comprobante?')) {
      try {
        await comprobanteService.delete(comprobante.id_comprobante);
        loadData();
      } catch (error) {
        console.error('Error al eliminar comprobante:', error);
        alert('Error al eliminar comprobante');
      }
    }
  };
const handleDownload = async (comprobante: any) => {
  try {
    const res = await comprobanteService.getById(comprobante.id_comprobante);
    console.log('Datos recibidos del backend:', res.data); 
    generarComprobantePDF(res.data);
  } catch (error) {
    console.error('Error completo:', error); 
    alert('Error al generar PDF del comprobante');
  }
};

  const resetForm = () => {
    setFormData({
      id_pago: '',
      id_orden: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      monto_total: '',
      tipo_comprobante: 'boleta',
    });
  };

  const handlePagoChange = (pagoId: string) => {
    const pago = pagos.find((p: any) => p.id_pago === parseInt(pagoId));
    if (pago) {
      setFormData({
        ...formData,
        id_pago: pagoId,
        id_orden: pago.id_orden,
        monto_total: pago.total_pago,
      });
    }
  };

  const columns = [
    { key: 'id_comprobante', label: 'ID' },
    { key: 'id_pago', label: 'ID Pago' },
    { key: 'id_orden', label: 'ID Orden' },
    {
      key: 'monto_total',
      label: 'Monto Total',
      render: (value: any) => `S/ ${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'fecha_emision',
      label: 'Fecha Emisión',
      render: (value: any) => new Date(value).toLocaleDateString('es-PE'),
    },
    {
      key: 'tipo_comprobante',
      label: 'Tipo',
      render: (value: any) => value.toUpperCase(),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleDownload(row)}
            title="Descargar PDF"
          >
            📄
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleDelete(row)}
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Comprobantes</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-success" 
            onClick={() => exportToExcel(comprobantes, 'comprobantes')}
          >
            ⬇ Descargar Excel
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            + Nuevo Comprobante
          </button>
        </div>
      </div>
      <Table
        columns={columns}
        data={comprobantes}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title="Nuevo Comprobante"
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Pago</label>
            <select
              className="form-select"
              value={formData.id_pago}
              onChange={(e) => handlePagoChange(e.target.value)}
              required
            >
              <option value="">Seleccionar pago</option>
              {pagos.map((pago) => (
                <option key={pago.id_pago} value={pago.id_pago}>
                  Pago #{pago.id_pago} - Orden #{pago.id_orden} - S/ {parseFloat(pago.total_pago).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Monto Total</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.monto_total}
                onChange={(e) => setFormData({ ...formData, monto_total: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Comprobante</label>
              <select
                className="form-select"
                value={formData.tipo_comprobante}
                onChange={(e) => setFormData({ ...formData, tipo_comprobante: e.target.value })}
                required
              >
                <option value="boleta">Boleta</option>
                <option value="factura">Factura</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Emisión</label>
            <input
              type="date"
              className="form-input"
              value={formData.fecha_emision}
              onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Comprobante
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Comprobantes;

