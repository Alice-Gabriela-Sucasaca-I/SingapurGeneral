import React, { useEffect, useState } from 'react';
import { productoService, categoriaProductoService } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';
import '../styles/Productos.css';

const Productos: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    disponibilidad: true,
    id_cat_producto: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        productoService.getAll(),
        categoriaProductoService.getAll(),
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await productoService.update(editing.id_producto, formData);
      } else {
        await productoService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto');
    }
  };

  const handleEdit = (producto: any) => {
    setEditing(producto);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      disponibilidad: producto.disponibilidad,
      id_cat_producto: producto.id_cat_producto,
    });
    setModalOpen(true);
  };

  const handleToggleDisponibilidad = async (producto: any) => {
    try {
      await productoService.update(producto.id_producto, {
        ...producto,
        disponibilidad: !producto.disponibilidad,
      });
      loadData();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar producto');
    }
  };

  const handleDelete = async (producto: any) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productoService.delete(producto.id_producto);
        loadData();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: '',
      disponibilidad: true,
      id_cat_producto: '',
    });
    setEditing(null);
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Productos</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nuevo Producto
        </button>
      </div>

      <div className="productos-grid">
        {productos.map((producto) => (
          <div
            key={producto.id_producto}
            className={`producto-card ${producto.disponibilidad ? 'disponible' : 'no-disponible'}`}
          >
            <div className="producto-header">
              <div className="producto-icon">🍤</div>
              <div
                className="producto-disponibilidad-badge"
                style={{
                  backgroundColor: producto.disponibilidad
                    ? 'rgba(27, 142, 97, 0.2)'
                    : 'rgba(184, 40, 40, 0.2)',
                  color: producto.disponibilidad ? 'var(--success)' : 'var(--error)',
                }}
              >
                {producto.disponibilidad ? '✓ Disponible' : '✗ No disponible'}
              </div>
            </div>
            <div className="producto-info">
              <h3 className="producto-nombre">{producto.nombre}</h3>
              <div className="producto-categoria">
                <span className="categoria-badge">{producto.categoria}</span>
              </div>
              <div className="producto-precio">
                S/ {parseFloat(producto.precio).toFixed(2)}
              </div>
            </div>
            <div className="producto-actions">
              <button
                className="btn-producto-toggle"
                onClick={() => handleToggleDisponibilidad(producto)}
                title={producto.disponibilidad ? 'Marcar como no disponible' : 'Marcar como disponible'}
              >
                {producto.disponibilidad ? '🔒' : '🔓'}
              </button>
              <button
                className="btn-producto-edit"
                onClick={() => handleEdit(producto)}
                title="Editar producto"
              >
                ✏️
              </button>
              <button
                className="btn-producto-delete"
                onClick={() => handleDelete(producto)}
                title="Eliminar producto"
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
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Nombre del Producto</label>
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
              <label className="form-label">Precio</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={formData.id_cat_producto}
                onChange={(e) => setFormData({ ...formData, id_cat_producto: e.target.value })}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_cat_producto} value={cat.id_cat_producto}>
                    {cat.categoria}
                  </option>
                ))}
              </select>
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
              <option value="false">No disponible</option>
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

export default Productos;
