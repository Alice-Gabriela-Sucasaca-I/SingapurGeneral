const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        o.id_orden,
        o.fecha_hora,
        o.total,
        o.estado,
        o.id_mesa,
        o.id_cliente,
        o.id_empleado,
        m.numero as numero_mesa,
        e.nombre as nombre_empleado,
        e.apellido_paterno as apellido_empleado
      FROM orden o
      INNER JOIN mesa m ON o.id_mesa = m.id_mesa
      INNER JOIN empleado e ON o.id_empleado = e.id_empleado
      ORDER BY o.fecha_hora DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [orden] = await pool.execute(`
      SELECT 
        o.*,
        m.numero as numero_mesa,
        e.nombre as nombre_empleado,
        e.apellido_paterno as apellido_empleado
      FROM orden o
      INNER JOIN mesa m ON o.id_mesa = m.id_mesa
      INNER JOIN empleado e ON o.id_empleado = e.id_empleado
      WHERE o.id_orden = ?
    `, [req.params.id]);
    
    if (orden.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    const [detalles] = await pool.execute(`
      SELECT 
        od.*,
        p.nombre as nombre_producto,
        p.precio as precio_actual
      FROM orden_detalle od
      INNER JOIN producto p ON od.id_producto = p.id_producto
      WHERE od.id_orden = ?
      ORDER BY od.sec_detalle
    `, [req.params.id]);
    
    res.json({ orden: orden[0], detalles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { fecha_hora, estado, id_mesa, id_cliente, id_empleado, detalles } = req.body;
    
    let total = 0;
    if (detalles && detalles.length > 0) {
      total = detalles.reduce((sum, det) => sum + (det.cantidad * det.precio_unitario), 0);
    }
    
    const [ordenResult] = await connection.execute(
      'INSERT INTO orden (fecha_hora, total, estado, id_mesa, id_cliente, id_empleado) VALUES (?, ?, ?, ?, ?, ?)',
      [fecha_hora || new Date(), total, estado || 'pendiente', id_mesa, id_cliente, id_empleado]
    );
    const ordenId = ordenResult.insertId;
    
    if (detalles && detalles.length > 0) {
      for (let i = 0; i < detalles.length; i++) {
        const det = detalles[i];
        await connection.execute(
          'INSERT INTO orden_detalle (id_orden, sec_detalle, cantidad, precio_unitario, sub_total, id_producto) VALUES (?, ?, ?, ?, ?, ?)',
          [ordenId, i + 1, det.cantidad, det.precio_unitario, det.cantidad * det.precio_unitario, det.id_producto]
        );
      }
    }
    
    await connection.commit();
    res.status(201).json({ id: ordenId, message: 'Orden creada exitosamente', total });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { estado, detalles, id_mesa, id_cliente, id_empleado } = req.body;
    const updates = [];
    const values = [];
    
    // Actualizar campos básicos
    if (estado !== undefined) {
      updates.push('estado = ?');
      values.push(estado);
    }
    if (id_mesa !== undefined) {
      updates.push('id_mesa = ?');
      values.push(id_mesa);
    }
    if (id_cliente !== undefined) {
      updates.push('id_cliente = ?');
      values.push(id_cliente);
    }
    if (id_empleado !== undefined) {
      updates.push('id_empleado = ?');
      values.push(id_empleado);
    }
    
    let total = 0;
    if (detalles && detalles.length > 0) {
      total = detalles.reduce((sum, det) => sum + (det.cantidad * det.precio_unitario), 0);
      updates.push('total = ?');
      values.push(total);
      
      updates.push('fecha_hora = DATE_SUB(NOW(), INTERVAL 5 HOUR)');
    }
    
    if (updates.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    values.push(req.params.id);
    const [result] = await connection.execute(
      `UPDATE orden SET ${updates.join(', ')} WHERE id_orden = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Si hay detalles, actualizar orden_detalle
    if (detalles && detalles.length > 0) {
      // Eliminar detalles anteriores
      await connection.execute('DELETE FROM orden_detalle WHERE id_orden = ?', [req.params.id]);
      
      // Insertar nuevos detalles
      for (let i = 0; i < detalles.length; i++) {
        const det = detalles[i];
        await connection.execute(
          'INSERT INTO orden_detalle (id_orden, sec_detalle, cantidad, precio_unitario, sub_total, id_producto) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.id, i + 1, det.cantidad, det.precio_unitario, det.cantidad * det.precio_unitario, det.id_producto]
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Orden actualizada exitosamente', total });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.execute('DELETE FROM orden_detalle WHERE id_orden = ?', [req.params.id]);
    
    const [result] = await connection.execute('DELETE FROM orden WHERE id_orden = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    await connection.commit();
    res.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;

