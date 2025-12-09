const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        et.*,
        e.nombre, e.apellido_paterno, e.apellido_materno, e.cargo,
        t.hora_entrada, t.hora_salida
      FROM empleado_turno et
      INNER JOIN empleado e ON et.id_empleado = e.id_empleado
      INNER JOIN turno t ON et.id_turno = t.id_turno
      ORDER BY et.fecha_turno DESC, t.hora_entrada
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/empleado/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        et.*,
        t.hora_entrada, t.hora_salida
      FROM empleado_turno et
      INNER JOIN turno t ON et.id_turno = t.id_turno
      WHERE et.id_empleado = ?
      ORDER BY et.fecha_turno DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_empleado, id_turno, fecha_turno } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO empleado_turno (id_empleado, id_turno, fecha_turno) VALUES (?, ?, ?)',
      [id_empleado, id_turno, fecha_turno]
    );
    res.status(201).json({ message: 'Turno asignado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:empleadoId/:turnoId/:fecha', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM empleado_turno WHERE id_empleado = ? AND id_turno = ? AND fecha_turno = ?',
      [req.params.empleadoId, req.params.turnoId, req.params.fecha]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    res.json({ message: 'Asignación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

