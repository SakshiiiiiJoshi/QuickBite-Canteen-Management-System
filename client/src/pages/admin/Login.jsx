import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoLockClosed, IoLogIn } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      localStorage.setItem('canteen_admin_token', res.data.token);
      localStorage.setItem('canteen_admin_user', JSON.stringify(res.data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem',
                color: 'white',
              }}
            >
              <IoLockClosed />
            </div>
            <h1>Admin Login</h1>
            <p className="subtitle">Sign in to manage your canteen</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                id="admin-username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="admin-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <IoLogIn />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Default credentials: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
