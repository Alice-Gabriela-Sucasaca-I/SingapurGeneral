const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM mesa ORDER BY numero');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM mesa WHERE id_mesa = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { capacidad, numero, disponibilidad } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO mesa (capacidad, numero, disponibilidad) VALUES (?, ?, ?)',
      [capacidad, numero, disponibilidad !== undefined ? disponibilidad : true]
    );
    res.status(201).json({ id: result.insertId, message: 'Mesa creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { capacidad, numero, disponibilidad } = req.body;
    const [result] = await pool.execute(
      'UPDATE mesa SET capacidad = ?, numero = ?, disponibilidad = ? WHERE id_mesa = ?',
      [capacidad, numero, disponibilidad, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json({ message: 'Mesa actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM mesa WHERE id_mesa = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json({ message: 'Mesa eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

