const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categoria_producto ORDER BY id_cat_producto');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categoria_producto WHERE id_cat_producto = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { categoria } = req.body;
    
    if (!categoria || categoria.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO categoria_producto (categoria) VALUES (?)',
      [categoria.trim()]
    );
    res.status(201).json({ id: result.insertId, message: 'Categoría creada exitosamente' });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: error.message || 'Error al crear categoría' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { categoria } = req.body;
    const [result] = await pool.execute(
      'UPDATE categoria_producto SET categoria = ? WHERE id_cat_producto = ?',
      [categoria, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM categoria_producto WHERE id_cat_producto = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

