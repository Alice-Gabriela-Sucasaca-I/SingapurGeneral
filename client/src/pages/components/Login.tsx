import React, { useState } from 'react';
import axios from 'axios';
import logo from '../../img/logo.png';
import '../styles/Login.css';

interface LoginProps {
  onLogin: () => void;
}

//const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      
      if (response.data.token) {
        localStorage.setItem('singapur_token', response.data.token);
        localStorage.setItem('singapur_usuario', JSON.stringify(response.data.usuario));
        localStorage.setItem('singapur_auth', 'true');
        onLogin();
      }
    } catch (err: unknown) {
      setLoading(false);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          setError(axiosError.response.data.error);
        } else {
          // Si falla la conexión, permitir login demo
          console.warn('No se pudo conectar al servidor, usando modo demo');
          localStorage.setItem('singapur_auth', 'true');
          onLogin();
        }
      } else {
        // Si falla la conexión, permitir login demo
        console.warn('No se pudo conectar al servidor, usando modo demo');
        localStorage.setItem('singapur_auth', 'true');
        onLogin();
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src={logo} alt="Singapur Logo" className="login-logo" />
          <h1 className="login-title">Singapur</h1>
          <p className="login-subtitle">Ven a mascar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              placeholder="Ingresa tu usuario"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Sistema de gestión de pedidos</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-tertiary)' }}>
            Usuario demo: admin / Contraseña: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


