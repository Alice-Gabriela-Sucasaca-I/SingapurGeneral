const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');


const validateDNI = (dni) => {
  return /^\d{8}$/.test(dni);
};

const validateRUC = (ruc) => {
  if (!/^\d{11}$/.test(ruc)) return false;
  if (!ruc.startsWith('10') && !ruc.startsWith('20')) return false;
  return true;
};

const validateCelular = (celular) => {
  if (!/^\d{9}$/.test(celular)) return false;
  if (!celular.startsWith('9')) return false;
  return true;
};

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
      ORDER BY c.id_cliente DESC
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
    

    if (tipo === 'persona') {
      const { dni, nro_celular } = req.body;
      
      if (!validateDNI(dni)) {
        await connection.rollback();
        return res.status(400).json({ error: 'DNI debe tener exactamente 8 dígitos' });
      }
      
      if (!validateCelular(nro_celular)) {
        await connection.rollback();
        return res.status(400).json({ error: 'Celular debe tener 9 dígitos y empezar con 9' });
      }
      

      const [existingDNI] = await connection.execute('SELECT id_cliente FROM persona WHERE dni = ?', [dni]);
      if (existingDNI.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Ya existe un cliente con este DNI' });
      }
    } else if (tipo === 'empresa') {
      const { ruc, telefono } = req.body;
      
      if (!validateRUC(ruc)) {
        await connection.rollback();
        return res.status(400).json({ error: 'RUC debe tener 11 dígitos y empezar con 10 o 20' });
      }
      
      if (!validateCelular(telefono)) {
        await connection.rollback();
        return res.status(400).json({ error: 'Teléfono debe tener 9 dígitos y empezar con 9' });
      }
      

      const [existingRUC] = await connection.execute('SELECT id_cliente FROM empresa WHERE ruc = ?', [ruc]);
      if (existingRUC.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Ya existe un cliente con este RUC' });
      }
    }
    
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
    

    if (tipo === 'persona') {
      const { dni, nro_celular } = req.body;
      
      if (!validateDNI(dni)) {
        await connection.rollback();
        return res.status(400).json({ error: 'DNI debe tener exactamente 8 dígitos' });
      }
      
      if (!validateCelular(nro_celular)) {
        await connection.rollback();
        return res.status(400).json({ error: 'Celular debe tener 9 dígitos y empezar con 9' });
      }
      

      const [existingDNI] = await connection.execute(
        'SELECT id_cliente FROM persona WHERE dni = ? AND id_cliente != ?',
        [dni, req.params.id]
      );
      if (existingDNI.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Ya existe otro cliente con este DNI' });
      }
    } else if (tipo === 'empresa') {
      const { ruc, telefono } = req.body;
      
      if (!validateRUC(ruc)) {
        await connection.rollback();
        return res.status(400).json({ error: 'RUC debe tener 11 dígitos y empezar con 10 o 20' });
      }
      
      if (!validateCelular(telefono)) {
        await connection.rollback();
        return res.status(400).json({ error: 'Teléfono debe tener 9 dígitos y empezar con 9' });
      }
      
     
      const [existingRUC] = await connection.execute(
        'SELECT id_cliente FROM empresa WHERE ruc = ? AND id_cliente != ?',
        [ruc, req.params.id]
      );
      if (existingRUC.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Ya existe otro cliente con este RUC' });
      }
    }
    
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.execute('DELETE FROM persona WHERE id_cliente = ?', [req.params.id]);
    await connection.execute('DELETE FROM empresa WHERE id_cliente = ?', [req.params.id]);
    
    const [result] = await connection.execute('DELETE FROM cliente WHERE id_cliente = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    await connection.commit();
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;