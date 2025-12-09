import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../img/logo.png';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/ordenes', label: 'Órdenes', icon: '🍽️' },
    { path: '/mesas', label: 'Mesas', icon: '🪑' },
    { path: '/productos', label: 'Productos', icon: '🍤' },
    { path: '/categorias', label: 'Categorías', icon: '📁' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/empleados', label: 'Empleados', icon: '👨‍💼' },
    { path: '/turnos', label: 'Turnos', icon: '⏰' },
    { path: '/pagos', label: 'Pagos', icon: '💳' },
    { path: '/comprobantes', label: 'Comprobantes', icon: '🧾' },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Singapur Logo" />
          <div className="logo-container">
            <h2 className="logo">Singapur</h2>
            <p className="subtitle">Ven a mascar</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
          {onLogout && (
            <button
              className="nav-item"
              onClick={onLogout}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="nav-icon">🚪</span>
              {sidebarOpen && <span className="nav-label">Cerrar Sesión</span>}
            </button>
          )}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="page-title">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

