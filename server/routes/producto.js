const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.disponibilidad,
        p.id_cat_producto,
        cp.categoria
      FROM producto p
      INNER JOIN categoria_producto cp ON p.id_cat_producto = cp.id_cat_producto
      ORDER BY p.id_producto
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.disponibilidad,
        p.id_cat_producto,
        cp.categoria
      FROM producto p
      INNER JOIN categoria_producto cp ON p.id_cat_producto = cp.id_cat_producto
      WHERE p.id_producto = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, precio, disponibilidad, id_cat_producto } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO producto (nombre, precio, disponibilidad, id_cat_producto) VALUES (?, ?, ?, ?)',
      [nombre, precio, disponibilidad !== undefined ? disponibilidad : true, id_cat_producto]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio, disponibilidad, id_cat_producto } = req.body;
    const [result] = await pool.execute(
      'UPDATE producto SET nombre = ?, precio = ?, disponibilidad = ?, id_cat_producto = ? WHERE id_producto = ?',
      [nombre, precio, disponibilidad, id_cat_producto, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM producto WHERE id_producto = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

