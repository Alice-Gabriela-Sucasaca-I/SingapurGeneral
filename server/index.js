const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

const turnoRoutes = require('./routes/turno');
const empleadoRoutes = require('./routes/empleado');
const mesaRoutes = require('./routes/mesa');
const categoriaProductoRoutes = require('./routes/categoriaProducto');
const clienteRoutes = require('./routes/cliente');
const productoRoutes = require('./routes/producto');
const ordenRoutes = require('./routes/orden');
const pagoRoutes = require('./routes/pago');
const comprobanteRoutes = require('./routes/comprobante');
const empleadoTurnoRoutes = require('./routes/empleadoTurno');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
/*
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://singapur-4hpn.onrender.com', 
  ],
  credentials: true
}));
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/turnos', turnoRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/categorias-producto', categoriaProductoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/comprobantes', comprobanteRoutes);
app.use('/api/empleado-turno', empleadoTurnoRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Servidor Singapur funcionando correctamente',
    status: 'OK'
  });
});

const buildPath = path.join(__dirname, '..', 'client', 'build');

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

//const path = require('path');


app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});



app.listen(PORT, async () => {
  console.log(` Servidor Singapur corriendo en puerto ${PORT}`);
  console.log(` API disponible en http://localhost:${PORT}/api`);
  await testConnection();
});


