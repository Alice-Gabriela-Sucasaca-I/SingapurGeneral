import React, { useEffect, useState } from 'react';
import { ordenService, mesaService, clienteService, empleadoService, productoService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';

const Ordenes: React.FC = () => {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [mesas, setMesas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    fecha_hora: new Date().toISOString().slice(0, 16),
    estado: 'pendiente',
    id_mesa: '',
    id_cliente: '',
    id_empleado: '',
    detalles: [] as any[],
  });
  const [detalleProducto, setDetalleProducto] = useState({
    id_producto: '',
    cantidad: 1,
    precio_unitario: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordenesRes, mesasRes, clientesRes, empleadosRes, productosRes] = await Promise.all([
        ordenService.getAll(),
        mesaService.getAll(),
        clienteService.getAll(),
        empleadoService.getAll(),
        productoService.getAll(),
      ]);
      setOrdenes(ordenesRes.data);
      setMesas(mesasRes.data);
      setClientes(clientesRes.data);
      setEmpleados(empleadosRes.data);
      setProductos(productosRes.data.filter((p: any) => p.disponibilidad));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetalle = () => {
    const producto = productos.find((p: any) => p.id_producto === parseInt(detalleProducto.id_producto));
    if (producto) {
      const nuevoDetalle = {
        id_producto: parseInt(detalleProducto.id_producto),
        cantidad: detalleProducto.cantidad,
        precio_unitario: producto.precio,
      };
      setFormData({
        ...formData,
        detalles: [...formData.detalles, nuevoDetalle],
      });
      setDetalleProducto({ id_producto: '', cantidad: 1, precio_unitario: 0 });
    }
  };

  const handleRemoveDetalle = (index: number) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.detalles.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }
    try {
      if (editing) {
        await ordenService.update(editing.id_orden, { estado: formData.estado });
      } else {
        await ordenService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al guardar orden:', error);
      alert('Error al guardar orden');
    }
  };

  const handleEdit = async (orden: any) => {
    try {
      const response = await ordenService.getById(orden.id_orden);
      const ordenData = response.data.orden;
      const detalles = response.data.detalles;
      setEditing(orden);
      setFormData({
        fecha_hora: ordenData.fecha_hora,
        estado: ordenData.estado,
        id_mesa: ordenData.id_mesa,
        id_cliente: ordenData.id_cliente,
        id_empleado: ordenData.id_empleado,
        detalles: detalles.map((d: any) => ({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
      });
      setModalOpen(true);
    } catch (error) {
      console.error('Error al cargar orden:', error);
    }
  };

  const handleDelete = async (orden: any) => {
    if (window.confirm('¿Estás seguro de eliminar esta orden?')) {
      try {
        await ordenService.delete(orden.id_orden);
        loadData();
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        alert('Error al eliminar orden');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_hora: new Date().toISOString().slice(0, 16),
      estado: 'pendiente',
      id_mesa: '',
      id_cliente: '',
      id_empleado: '',
      detalles: [],
    });
    setDetalleProducto({ id_producto: '', cantidad: 1, precio_unitario: 0 });
    setEditing(null);
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((sum, det) => sum + (det.cantidad * det.precio_unitario), 0);
  };

  const columns = [
    { key: 'id_orden', label: 'ID' },
    {
      key: 'fecha_hora',
      label: 'Fecha/Hora',
      render: (value: any) => new Date(value).toLocaleString('es-PE'),
    },
    { key: 'numero_mesa', label: 'Mesa' },
    {
      key: 'total',
      label: 'Total',
      render: (value: any) => `S/ ${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: any) => {
        const estadoConfig: any = {
          pendiente: { color: 'var(--warning)', bg: 'rgba(199, 119, 18, 0.2)' },
          en_preparacion: { color: 'var(--secondary)', bg: 'rgba(11, 92, 203, 0.2)' },
          listo: { color: 'var(--success)', bg: 'rgba(27, 142, 97, 0.2)' },
          pagado: { color: 'var(--success)', bg: 'rgba(27, 142, 97, 0.2)' },
          cancelado: { color: 'var(--error)', bg: 'rgba(184, 40, 40, 0.2)' },
        };
        const config = estadoConfig[value] || estadoConfig.pendiente;
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
            {value.replace('_', ' ')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Órdenes</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nueva Orden
        </button>
      </div>
      <Table
        columns={columns}
        data={ordenes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editing ? 'Editar Orden' : 'Nueva Orden'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha y Hora</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.fecha_hora}
                onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_preparacion">En Preparación</option>
                <option value="listo">Listo</option>
                <option value="pagado">Pagado</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mesa</label>
              <select
                className="form-select"
                value={formData.id_mesa}
                onChange={(e) => setFormData({ ...formData, id_mesa: e.target.value })}
                required
              >
                <option value="">Seleccionar mesa</option>
                {mesas.map((mesa) => (
                  <option key={mesa.id_mesa} value={mesa.id_mesa}>
                    Mesa {mesa.numero} ({mesa.capacidad} personas)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <select
                className="form-select"
                value={formData.id_cliente}
                onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id_cliente} value={cliente.id_cliente}>
                    {cliente.tipo === 'persona'
                      ? `${cliente.nombre || ''} ${cliente.apellido_paterno || ''}`.trim()
                      : cliente.razon_social || ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Empleado</label>
              <select
                className="form-select"
                value={formData.id_empleado}
                onChange={(e) => setFormData({ ...formData, id_empleado: e.target.value })}
                required
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre} {emp.apellido_paterno}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Productos</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <select
                className="form-select"
                style={{ flex: 1 }}
                value={detalleProducto.id_producto}
                onChange={(e) => {
                  const producto = productos.find((p: any) => p.id_producto === parseInt(e.target.value));
                  setDetalleProducto({
                    ...detalleProducto,
                    id_producto: e.target.value,
                    precio_unitario: producto?.precio || 0,
                  });
                }}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((prod) => (
                  <option key={prod.id_producto} value={prod.id_producto}>
                    {prod.nombre} - S/ {parseFloat(prod.precio).toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="form-input"
                style={{ width: '100px' }}
                value={detalleProducto.cantidad}
                onChange={(e) => setDetalleProducto({ ...detalleProducto, cantidad: parseInt(e.target.value) || 1 })}
                min="1"
                placeholder="Cantidad"
              />
              <button type="button" className="btn btn-primary" onClick={handleAddDetalle}>
                Agregar
              </button>
            </div>
            {formData.detalles.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Producto</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Cantidad</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Precio Unit.</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
                      <th style={{ padding: '0.5rem' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalles.map((det, index) => {
                      const producto = productos.find((p: any) => p.id_producto === det.id_producto);
                      return (
                        <tr key={index}>
                          <td style={{ padding: '0.5rem' }}>{producto?.nombre || '-'}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>{det.cantidad}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                            S/ {parseFloat(det.precio_unitario).toFixed(2)}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                            S/ {(det.cantidad * det.precio_unitario).toFixed(2)}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => handleRemoveDetalle(index)}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
                      <td colSpan={3} style={{ padding: '0.5rem', textAlign: 'right' }}>Total:</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        S/ {calcularTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
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

export default Ordenes;

