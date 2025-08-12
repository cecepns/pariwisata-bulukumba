import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@pariwisata.go.id');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Email atau password salah');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="form-control">
          <label className="label"><span className="label-text">Email</span></label>
          <input className="input input-bordered" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Password</span></label>
          <input className="input input-bordered" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-error text-sm">{error}</p> : null}
        <button className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? 'Memproses…' : 'Masuk' }
        </button>
      </form>
    </div>
  );
}


