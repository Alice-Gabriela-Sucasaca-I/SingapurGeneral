const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'db_singapur',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    console.log(' Conectado a la base de datos');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        cargo VARCHAR(50) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla de usuarios creada/verificada');

    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log(' Hash generado:', hash);

    try {
      await connection.execute(
        'INSERT INTO usuario (usuario, password, nombre, cargo) VALUES (?, ?, ?, ?)',
        ['admin', hash, 'Administrador', 'Administrador']
      );
      console.log(' Usuario admin creado exitosamente');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('  Usuario admin ya existe, actualizando contraseña...');
        await connection.execute(
          'UPDATE usuario SET password = ? WHERE usuario = ?',
          [hash, 'admin']
        );
        console.log(' Contraseña del admin actualizada');
      } else {
        throw error;
      }
    }

    await connection.end();
    console.log('Proceso completado');
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

createUser();

