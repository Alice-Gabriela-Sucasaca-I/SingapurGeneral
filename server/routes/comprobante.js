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

    const [comprobanteRows] = await pool.execute(`
      SELECT 
        c.*,
        p.tipo_pago,
        p.fecha as fecha_pago,
        p.hora_pago as hora_pago,
        o.id_orden,
        o.fecha_hora as orden_fecha_hora,
        o.id_cliente,
        o.id_empleado,
        o.id_mesa,
        m.numero as numero_mesa,
        per.nombre as cliente_nombre,
        per.apellido_paterno as cliente_apellido_paterno,
        per.apellido_materno as cliente_apellido_materno,
        per.nro_celular as cliente_telefono,
        per.direccion as cliente_direccion,
        per.dni as cliente_dni,
        ent.razon_social as cliente_razon_social,
        ent.direccion as cliente_direccion_empresa,
        ent.telefono as cliente_telefono_empresa,
        ent.ruc as cliente_ruc,
        emp.nombre as empleado_nombre,
        emp.apellido_paterno as empleado_apellido_paterno,
        emp.apellido_materno as empleado_apellido_materno,
        emp.cargo as empleado_cargo
      FROM comprobante c
      INNER JOIN pago p ON c.id_pago = p.id_pago
      INNER JOIN orden o ON c.id_orden = o.id_orden
      LEFT JOIN mesa m ON o.id_mesa = m.id_mesa
      LEFT JOIN persona per ON o.id_cliente = per.id_cliente
      LEFT JOIN empresa ent ON o.id_cliente = ent.id_cliente
      LEFT JOIN empleado emp ON o.id_empleado = emp.id_empleado
      WHERE c.id_comprobante = ?
    `, [req.params.id]);

    if (comprobanteRows.length === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    const c = comprobanteRows[0];


    const [detallesRows] = await pool.execute(`
      SELECT 
        od.cantidad,
        od.precio_unitario,
        od.sub_total,
        p.nombre as nombre_producto
      FROM orden_detalle od
      LEFT JOIN producto p ON od.id_producto = p.id_producto
      WHERE od.id_orden = ?
      ORDER BY od.sec_detalle
    `, [c.id_orden]);


    let pagoDetalle = null;
    if (c.tipo_pago === 'efectivo') {
      const [efectivo] = await pool.execute('SELECT * FROM efectivo WHERE id_pago = ?', [c.id_pago]);
      pagoDetalle = efectivo[0] || null;
    } else if (c.tipo_pago === 'tarjeta') {
      const [tarjeta] = await pool.execute('SELECT * FROM tarjeta WHERE id_pago = ?', [c.id_pago]);
      pagoDetalle = tarjeta[0] || null;
    } else if (c.tipo_pago === 'qr') {
      const [qr] = await pool.execute('SELECT * FROM qr WHERE id_pago = ?', [c.id_pago]);
      pagoDetalle = qr[0] || null;
    }

    
    const result = {
      id_comprobante: c.id_comprobante,
      tipo_comprobante: c.tipo_comprobante,
      fecha_emision: c.fecha_emision,
      monto_total: c.monto_total || c.monto || 0,
      cliente: {
        tipo: c.tipo_cliente || 'persona',
        nombre: c.nombre || c.razon_social || null,
        apellido_paterno: c.apellido_paterno || null,
        apellido_materno: c.apellido_materno || null,
        razon_social: c.razon_social || null,
        dni: c.dni || null,
        ruc: c.ruc || null,
        direccion: c.direccion || null,
        telefono: c.telefono || null,
        email: c.email || null
      },
      empleado: {
        nombre: c.empleado_nombre || null,
        apellido_paterno: c.empleado_apellido_paterno || null,
        apellido_materno: c.empleado_apellido_materno || null,
        cargo: c.empleado_cargo || null
      },
      orden: {
        id_orden: c.id_orden,
        fecha_hora: c.orden_fecha_hora,
        numero_mesa: c.numero_mesa || null
      },
      detalles: detallesRows.map(d => ({
        nombre_producto: d.nombre_producto || 'Producto',
        cantidad: d.cantidad,
        precio_unitario: parseFloat(d.precio_unitario),
        sub_total: parseFloat(d.sub_total)
      })),
      pago: {
        tipo_pago: c.tipo_pago,
        fecha_pago: c.fecha_pago ? `${c.fecha_pago} ${c.hora_pago || ''}`.trim() : null,
        detalle: pagoDetalle
      }
    };

    res.json(result);
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

