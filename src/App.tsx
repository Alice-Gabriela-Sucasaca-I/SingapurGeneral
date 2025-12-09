import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/components/Login';
import Dashboard from './pages/components/Dashboard';
import Empleados from './pages/components/Empleados';
import Mesas from './pages/components/Mesas';
import Productos from './pages/components/Productos';
import Categorias from './pages/components/Categorias';
import Clientes from './pages/components/Clientes';
import Ordenes from './pages/components/Ordenes';
import Pagos from './pages/components/Pagos';
import Comprobantes from './pages/components/Comprobantes';
import Turnos from './pages/components/Turnos';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('singapur_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('singapur_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('singapur_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/mesas" element={<Mesas />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/comprobantes" element={<Comprobantes />} />
          <Route path="/turnos" element={<Turnos />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

