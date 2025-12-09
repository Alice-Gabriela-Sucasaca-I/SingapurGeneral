const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.*,
        p.tipo_pago,
        o.total as total_orden
      FROM comprobante c
      INNER JOIN pago p ON c.id_pago = p.id_pago
      INNER JOIN orden o ON c.id_orden = o.id_orden
      ORDER BY c.fecha_emision DESC
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
        c.*,
        p.tipo_pago,
        o.total as total_orden
      FROM comprobante c
      INNER JOIN pago p ON c.id_pago = p.id_pago
      INNER JOIN orden o ON c.id_orden = o.id_orden
      WHERE c.id_comprobante = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_pago, id_orden, fecha_emision, monto_total, tipo_comprobante } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO comprobante (id_pago, id_orden, fecha_emision, monto_total, tipo_comprobante) VALUES (?, ?, ?, ?, ?)',
      [id_pago, id_orden, fecha_emision || new Date().toISOString().split('T')[0], monto_total, tipo_comprobante]
    );
    res.status(201).json({ id: result.insertId, message: 'Comprobante creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM comprobante WHERE id_comprobante = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }
    res.json({ message: 'Comprobante eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

