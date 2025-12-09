const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');


router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM empleado ORDER BY id_empleado');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM empleado WHERE id_empleado = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, cargo, sueldo, nro_celular } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO empleado (nombre, apellido_paterno, apellido_materno, cargo, sueldo, nro_celular) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido_paterno, apellido_materno, cargo, sueldo, nro_celular]
    );
    res.status(201).json({ id: result.insertId, message: 'Empleado creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, cargo, sueldo, nro_celular } = req.body;
    const [result] = await pool.execute(
      'UPDATE empleado SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, cargo = ?, sueldo = ?, nro_celular = ? WHERE id_empleado = ?',
      [nombre, apellido_paterno, apellido_materno, cargo, sueldo, nro_celular, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM empleado WHERE id_empleado = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

