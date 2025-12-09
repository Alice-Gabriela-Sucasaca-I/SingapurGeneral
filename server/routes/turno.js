const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM turno ORDER BY id_turno');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM turno WHERE id_turno = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { hora_entrada, hora_salida } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO turno (hora_entrada, hora_salida) VALUES (?, ?)',
      [hora_entrada, hora_salida]
    );
    res.status(201).json({ id: result.insertId, message: 'Turno creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { hora_entrada, hora_salida } = req.body;
    const [result] = await pool.execute(
      'UPDATE turno SET hora_entrada = ?, hora_salida = ? WHERE id_turno = ?',
      [hora_entrada, hora_salida, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json({ message: 'Turno actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM turno WHERE id_turno = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

