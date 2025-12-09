const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.id_cliente,
        c.tipo,
        p.nombre, p.apellido_paterno, p.apellido_materno, p.nro_celular, p.direccion, p.dni,
        e.razon_social, e.direccion as direccion_empresa, e.telefono, e.ruc
      FROM cliente c
      LEFT JOIN persona p ON c.id_cliente = p.id_cliente
      LEFT JOIN empresa e ON c.id_cliente = e.id_cliente
      ORDER BY c.id_cliente
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
        c.id_cliente,
        c.tipo,
        p.nombre, p.apellido_paterno, p.apellido_materno, p.nro_celular, p.direccion, p.dni,
        e.razon_social, e.direccion as direccion_empresa, e.telefono, e.ruc
      FROM cliente c
      LEFT JOIN persona p ON c.id_cliente = p.id_cliente
      LEFT JOIN empresa e ON c.id_cliente = e.id_cliente
      WHERE c.id_cliente = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { tipo } = req.body;
    
    const [clienteResult] = await connection.execute(
      'INSERT INTO cliente (tipo) VALUES (?)',
      [tipo]
    );
    const clienteId = clienteResult.insertId;
    
    if (tipo === 'persona') {
      const { nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni } = req.body;
      await connection.execute(
        'INSERT INTO persona (id_cliente, nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [clienteId, nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni]
      );
    } else if (tipo === 'empresa') {
      const { razon_social, direccion, telefono, ruc } = req.body;
      await connection.execute(
        'INSERT INTO empresa (id_cliente, razon_social, direccion, telefono, ruc) VALUES (?, ?, ?, ?, ?)',
        [clienteId, razon_social, direccion, telefono, ruc]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: clienteId, message: 'Cliente creado exitosamente' });
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
    
    const { tipo } = req.body;
    
    await connection.execute(
      'UPDATE cliente SET tipo = ? WHERE id_cliente = ?',
      [tipo, req.params.id]
    );
    
    if (tipo === 'persona') {
      const { nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni } = req.body;
      await connection.execute('DELETE FROM empresa WHERE id_cliente = ?', [req.params.id]);
      const [existing] = await connection.execute('SELECT * FROM persona WHERE id_cliente = ?', [req.params.id]);
      if (existing.length > 0) {
        await connection.execute(
          'UPDATE persona SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, nro_celular = ?, direccion = ?, dni = ? WHERE id_cliente = ?',
          [nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni, req.params.id]
        );
      } else {
        await connection.execute(
          'INSERT INTO persona (id_cliente, nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.params.id, nombre, apellido_paterno, apellido_materno, nro_celular, direccion, dni]
        );
      }
    } else if (tipo === 'empresa') {
      const { razon_social, direccion, telefono, ruc } = req.body;
      await connection.execute('DELETE FROM persona WHERE id_cliente = ?', [req.params.id]);
      const [existing] = await connection.execute('SELECT * FROM empresa WHERE id_cliente = ?', [req.params.id]);
      if (existing.length > 0) {
        await connection.execute(
          'UPDATE empresa SET razon_social = ?, direccion = ?, telefono = ?, ruc = ? WHERE id_cliente = ?',
          [razon_social, direccion, telefono, ruc, req.params.id]
        );
      } else {
        await connection.execute(
          'INSERT INTO empresa (id_cliente, razon_social, direccion, telefono, ruc) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, razon_social, direccion, telefono, ruc]
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM cliente WHERE id_cliente = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

