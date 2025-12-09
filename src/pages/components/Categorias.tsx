import React, { useEffect, useState } from 'react';
import { categoriaProductoService } from '../../services/api';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import '../styles/Page.css';

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    categoria: '',
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await categoriaProductoService.getAll();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoriaProductoService.update(editing.id_cat_producto, formData);
      } else {
        await categoriaProductoService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      loadCategorias();
    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al guardar categoría';
      alert(errorMessage);
    }
  };

  const handleEdit = (categoria: any) => {
    setEditing(categoria);
    setFormData({
      categoria: categoria.categoria,
    });
    setModalOpen(true);
  };

  const handleDelete = async (categoria: any) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await categoriaProductoService.delete(categoria.id_cat_producto);
        loadCategorias();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert('Error al eliminar categoría');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      categoria: '',
    });
    setEditing(null);
  };

  const columns = [
    { key: 'id_cat_producto', label: 'ID' },
    { key: 'categoria', label: 'Categoría' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Categorías</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nueva Categoría
        </button>
      </div>
      <Table
        columns={columns}
        data={categorias}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Nombre de Categoría</label>
            <input
              type="text"
              className="form-input"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            />
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

export default Categorias;

