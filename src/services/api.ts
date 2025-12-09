import axios from 'axios';

//const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/*
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
*/

const api = axios.create({
  baseURL: `${API_URL}/api`,  
  headers: {
    'Content-Type': 'application/json',
  },
});

export const turnoService = {
  getAll: () => api.get('/turnos'),
  getById: (id: number) => api.get(`/turnos/${id}`),
  create: (data: any) => api.post('/turnos', data),
  update: (id: number, data: any) => api.put(`/turnos/${id}`, data),
  delete: (id: number) => api.delete(`/turnos/${id}`),
};

export const empleadoService = {
  getAll: () => api.get('/empleados'),
  getById: (id: number) => api.get(`/empleados/${id}`),
  create: (data: any) => api.post('/empleados', data),
  update: (id: number, data: any) => api.put(`/empleados/${id}`, data),
  delete: (id: number) => api.delete(`/empleados/${id}`),
};

export const mesaService = {
  getAll: () => api.get('/mesas'),
  getById: (id: number) => api.get(`/mesas/${id}`),
  create: (data: any) => api.post('/mesas', data),
  update: (id: number, data: any) => api.put(`/mesas/${id}`, data),
  delete: (id: number) => api.delete(`/mesas/${id}`),
};

export const categoriaProductoService = {
  getAll: () => api.get('/categorias-producto'),
  getById: (id: number) => api.get(`/categorias-producto/${id}`),
  create: (data: any) => api.post('/categorias-producto', data),
  update: (id: number, data: any) => api.put(`/categorias-producto/${id}`, data),
  delete: (id: number) => api.delete(`/categorias-producto/${id}`),
};

export const clienteService = {
  getAll: () => api.get('/clientes'),
  getById: (id: number) => api.get(`/clientes/${id}`),
  create: (data: any) => api.post('/clientes', data),
  update: (id: number, data: any) => api.put(`/clientes/${id}`, data),
  delete: (id: number) => api.delete(`/clientes/${id}`),
};

export const productoService = {
  getAll: () => api.get('/productos'),
  getById: (id: number) => api.get(`/productos/${id}`),
  create: (data: any) => api.post('/productos', data),
  update: (id: number, data: any) => api.put(`/productos/${id}`, data),
  delete: (id: number) => api.delete(`/productos/${id}`),
};

export const ordenService = {
  getAll: () => api.get('/ordenes'),
  getById: (id: number) => api.get(`/ordenes/${id}`),
  create: (data: any) => api.post('/ordenes', data),
  update: (id: number, data: any) => api.put(`/ordenes/${id}`, data),
  delete: (id: number) => api.delete(`/ordenes/${id}`),
};

export const pagoService = {
  getAll: () => api.get('/pagos'),
  getById: (id: number) => api.get(`/pagos/${id}`),
  create: (data: any) => api.post('/pagos', data),
  delete: (id: number) => api.delete(`/pagos/${id}`),
};

export const comprobanteService = {
  getAll: () => api.get('/comprobantes'),
  getById: (id: number) => api.get(`/comprobantes/${id}`),
  create: (data: any) => api.post('/comprobantes', data),
  delete: (id: number) => api.delete(`/comprobantes/${id}`),
};

export const empleadoTurnoService = {
  getAll: () => api.get('/empleado-turno'),
  getByEmpleado: (id: number) => api.get(`/empleado-turno/empleado/${id}`),
  create: (data: any) => api.post('/empleado-turno', data),
  delete: (empleadoId: number, turnoId: number, fecha: string) => 
    api.delete(`/empleado-turno/${empleadoId}/${turnoId}/${fecha}`),
};

export default api;

