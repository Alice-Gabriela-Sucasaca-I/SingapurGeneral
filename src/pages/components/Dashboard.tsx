import React, { useEffect, useState } from 'react';
import { ordenService, mesaService, productoService, clienteService, pagoService } from '../../services/api';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    ordenes: 0,
    ordenesHoy: 0,
    mesas: 0,
    mesasDisponibles: 0,
    productos: 0,
    clientes: 0,
    ventasHoy: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordenes, mesas, productos, clientes, pagos] = await Promise.all([
          ordenService.getAll(),
          mesaService.getAll(),
          productoService.getAll(),
          clienteService.getAll(),
          pagoService.getAll(),
        ]);

        const hoy = new Date().toISOString().split('T')[0];
        const ordenesHoy = ordenes.data.filter((o: any) => 
          new Date(o.fecha_hora).toISOString().split('T')[0] === hoy
        );
        const ventasHoy = pagos.data
          .filter((p: any) => p.fecha === hoy)
          .reduce((sum: number, p: any) => sum + parseFloat(p.total_pago), 0);

        setStats({
          ordenes: ordenes.data.length,
          ordenesHoy: ordenesHoy.length,
          mesas: mesas.data.length,
          mesasDisponibles: mesas.data.filter((m: any) => m.disponibilidad).length,
          productos: productos.data.length,
          clientes: clientes.data.length,
          ventasHoy: ventasHoy,
        });

        const ordenesOrdenadas = ordenes.data
          .sort((a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
          .slice(0, 5);
        setRecentOrders(ordenesOrdenadas);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ventas del Día</h3>
            <p className="stat-number">S/ {stats.ventasHoy.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>Órdenes Hoy</h3>
            <p className="stat-number">{stats.ordenesHoy}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-content">
            <h3>Mesas Disponibles</h3>
            <p className="stat-number">{stats.mesasDisponibles} / {stats.mesas}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Clientes</h3>
            <p className="stat-number">{stats.clientes}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="chart-card">
          <h3>Resumen General</h3>
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Órdenes</span>
              <strong style={{ color: 'var(--text-primary)' }}>{stats.ordenes}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Productos</span>
              <strong style={{ color: 'var(--text-primary)' }}>{stats.productos}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Mesas</span>
              <strong style={{ color: 'var(--text-primary)' }}>{stats.mesas}</strong>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          {recentOrders.length > 0 ? (
            <div>
              {recentOrders.map((orden: any) => (
                <div key={orden.id_orden} className="activity-item">
                  <div className="activity-info">
                    <strong>Orden #{orden.id_orden}</strong>
                    <span>Mesa {orden.numero_mesa} - {new Date(orden.fecha_hora).toLocaleString('es-PE')}</span>
                  </div>
                  <span className={`activity-status ${orden.estado.toLowerCase()}`}>
                    {orden.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>
              No hay órdenes recientes
            </p>
          )}
        </div>
      </div>

      <div className="welcome-section">
        <h2>Bienvenido a Singapur</h2>
        <p>Sistema de gestión de pedidos para la cevichería "Ven a mascar"</p>
      </div>
    </div>
  );
};

export default Dashboard;

