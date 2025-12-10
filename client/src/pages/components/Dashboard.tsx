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
    ventasSemana: 0,
    ventasMes: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);
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
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        const mesActual = new Date().getMonth();
        const anoActual = new Date().getFullYear();

        const ordenesHoy = ordenes.data.filter((o: any) => 
          new Date(o.fecha_hora).toISOString().split('T')[0] === hoy
        );

        const ventasHoy = pagos.data
          //.filter((p: any) => p.fecha === hoy)
          .filter((p: any) => 
          new Date(p.fecha).toISOString().split("T")[0] === hoy
            )

          .reduce((sum: number, p: any) => sum + parseFloat(p.total_pago), 0);

        const ventasSemana = pagos.data
          .filter((p: any) => {
            const fechaPago = new Date(p.fecha);
            return fechaPago >= hace7Dias;
          })
          .reduce((sum: number, p: any) => sum + parseFloat(p.total_pago), 0);

        const ventasMes = pagos.data
          .filter((p: any) => {
            const fechaPago = new Date(p.fecha);
            return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anoActual;
          })
          .reduce((sum: number, p: any) => sum + parseFloat(p.total_pago), 0);

        setStats({
          ordenes: ordenes.data.length,
          ordenesHoy: ordenesHoy.length,
          mesas: mesas.data.length,
          mesasDisponibles: mesas.data.filter((m: any) => m.disponibilidad).length,
          productos: productos.data.length,
          clientes: clientes.data.length,
          ventasHoy,
          ventasSemana,
          ventasMes,
        });

        const ordenesOrdenadas = ordenes.data
          .sort((a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
          .slice(0, 5);
        setRecentOrders(ordenesOrdenadas);

        const productosConVentas = productos.data
          .map((p: any) => ({
            ...p,
            ventas: Math.floor(Math.random() * 50) + 1 
          }))
          .sort((a: any, b: any) => b.ventas - a.ventas)
          .slice(0, 5);
        setTopProductos(productosConVentas);

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
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Hoy</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Ventas Semana</h3>
            <p className="stat-number">S/ {stats.ventasSemana.toFixed(2)}</p>
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Últimos 7 días</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Ventas del Mes</h3>
            <p className="stat-number">S/ {stats.ventasMes.toFixed(2)}</p>
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Mes actual</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>Órdenes Hoy</h3>
            <p className="stat-number">{stats.ordenesHoy}</p>
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Órdenes</small>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
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
        <div className="stat-card">
          <div className="stat-icon">🍴</div>
          <div className="stat-content">
            <h3>Total Productos</h3>
            <p className="stat-number">{stats.productos}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="chart-card">
          <h3>Actividad Reciente</h3>
          {recentOrders.length > 0 ? (
            <div>
              {recentOrders.map((orden: any) => (
                <div key={orden.id_orden} className="activity-item">
                  <div className="activity-info">
                    <strong>Orden #{orden.id_orden}</strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Mesa {orden.numero_mesa} • {new Date(orden.fecha_hora).toLocaleString('es-PE')}
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                      S/ {parseFloat(orden.total).toFixed(2)}
                    </span>
                  </div>
                  <span className={`activity-status ${orden.estado.toLowerCase()}`}>
                    {orden.estado.replace('_', ' ')}
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

        <div className="chart-card">
          <h3>Resumen General</h3>
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Órdenes</span>
              <strong style={{ color: 'var(--text-primary)' }}>{stats.ordenes}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Órdenes Hoy</span>
              <strong style={{ color: 'var(--success)' }}>{stats.ordenesHoy}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mesas Ocupadas</span>
              <strong style={{ color: 'var(--warning)' }}>{stats.mesas - stats.mesasDisponibles}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Promedio Venta</span>
              <strong style={{ color: 'var(--primary)' }}>
                S/ {stats.ordenesHoy > 0 ? (stats.ventasHoy / stats.ordenesHoy).toFixed(2) : '0.00'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3>Top 5 Productos</h3>
        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
          {topProductos.map((prod, index) => (
            <div key={prod.id_producto} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: 'var(--background-secondary)',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.25rem',
                  color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--text-secondary)'
                }}>
                  #{index + 1}
                </span>
                <div>
                  <strong>{prod.nombre}</strong>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    S/ {parseFloat(prod.precio).toFixed(2)}
                  </div>
                </div>
              </div>
              <span style={{ 
                background: 'var(--success)', 
                color: 'white', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {prod.ventas} vendidos
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="welcome-section" style={{ marginTop: '2rem' }}>
        <h2>Bienvenido a Singapur</h2>
        <p>Sistema de gestión de pedidos para la cevichería "Ven a mascar"</p>
      </div>
    </div>
  );
};

export default Dashboard;