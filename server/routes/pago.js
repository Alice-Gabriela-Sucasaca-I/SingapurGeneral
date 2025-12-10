const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        o.total as total_orden,
        o.estado as estado_orden
      FROM pago p
      INNER JOIN orden o ON p.id_orden = o.id_orden
      ORDER BY p.fecha DESC, p.hora_pago DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [pago] = await pool.execute(`
      SELECT 
        p.*,
        o.total as total_orden
      FROM pago p
      INNER JOIN orden o ON p.id_orden = o.id_orden
      WHERE p.id_pago = ?
    `, [req.params.id]);
    
    if (pago.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    
    const pagoData = pago[0];
    
    if (pagoData.tipo_pago === 'efectivo') {
      const [efectivo] = await pool.execute('SELECT * FROM efectivo WHERE id_pago = ?', [req.params.id]);
      pagoData.detalle = efectivo[0] || null;
    } else if (pagoData.tipo_pago === 'tarjeta') {
      const [tarjeta] = await pool.execute('SELECT * FROM tarjeta WHERE id_pago = ?', [req.params.id]);
      pagoData.detalle = tarjeta[0] || null;
    } else if (pagoData.tipo_pago === 'qr') {
      const [qr] = await pool.execute('SELECT * FROM qr WHERE id_pago = ?', [req.params.id]);
      pagoData.detalle = qr[0] || null;
    }
    
    res.json(pagoData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id_orden, total_pago, fecha, hora_pago, tipo_pago, detalle } = req.body;

    const [pagoResult] = await connection.execute(
      'INSERT INTO pago (id_orden, total_pago, fecha, hora_pago, tipo_pago) VALUES (?, ?, ?, ?, ?)',
      [id_orden, total_pago, fecha || new Date().toISOString().split('T')[0], hora_pago || new Date().toTimeString().split(' ')[0], tipo_pago]
    );
    const pagoId = pagoResult.insertId;

    if (tipo_pago === 'efectivo' && detalle) {
      const cambio = parseFloat(detalle.cambio) || 0;
      await connection.execute(
        'INSERT INTO efectivo (id_pago, cambio) VALUES (?, ?)',
        [pagoId, cambio]
      );
    } else if (tipo_pago === 'tarjeta' && detalle) {
      await connection.execute(
        'INSERT INTO tarjeta (id_pago, numero, entidad) VALUES (?, ?, ?)',
        [pagoId, detalle.numero, detalle.entidad]
      );
    } else if (tipo_pago === 'qr' && detalle) {
      await connection.execute(
        'INSERT INTO qr (id_pago, imagen_qr) VALUES (?, ?)',
        [pagoId, detalle.imagen_qr]
      );
    }

    // Marcar orden como pagada
    await connection.execute(
      'UPDATE orden SET estado = ? WHERE id_orden = ?',
      ['pagado', id_orden]
    );

    // Liberar la mesa asociada a la orden
    const [ordenRows] = await connection.execute('SELECT id_mesa FROM orden WHERE id_orden = ?', [id_orden]);
    if (ordenRows.length > 0) {
      const id_mesa = ordenRows[0].id_mesa;
      await connection.execute('UPDATE mesa SET disponibilidad = ? WHERE id_mesa = ?', [1, id_mesa]);
    }

    await connection.commit();
    res.status(201).json({ id: pagoId, message: 'Pago registrado exitosamente' });
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

    const [pago] = await connection.execute('SELECT tipo_pago, id_orden FROM pago WHERE id_pago = ?', [req.params.id]);
    if (pago.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const id_orden = pago[0].id_orden;

    if (pago[0].tipo_pago === 'efectivo') {
      await connection.execute('DELETE FROM efectivo WHERE id_pago = ?', [req.params.id]);
    } else if (pago[0].tipo_pago === 'tarjeta') {
      await connection.execute('DELETE FROM tarjeta WHERE id_pago = ?', [req.params.id]);
    } else if (pago[0].tipo_pago === 'qr') {
      await connection.execute('DELETE FROM qr WHERE id_pago = ?', [req.params.id]);
    }

    await connection.execute('DELETE FROM pago WHERE id_pago = ?', [req.params.id]);

    // Revertir estado de la orden a pendiente
    await connection.execute(
      'UPDATE orden SET estado = ? WHERE id_orden = ?',
      ['pendiente', id_orden]
    );

    // Marcar la mesa asociada como ocupada nuevamente
    const [ordenRows] = await connection.execute('SELECT id_mesa FROM orden WHERE id_orden = ?', [id_orden]);
    if (ordenRows.length > 0) {
      const id_mesa = ordenRows[0].id_mesa;
      await connection.execute('UPDATE mesa SET disponibilidad = ? WHERE id_mesa = ?', [0, id_mesa]);
    }

    await connection.commit();
    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;