import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { homeFor } from '../components/ProtectedRoute';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(email.trim(), password);
      navigate(homeFor(profile.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand brand-lg">
          <span className="brand-mark">D</span>
          <span>Dexa WFH</span>
        </div>
        <h1>Masuk ke akun Anda</h1>
        <p className="muted">Absensi WFH karyawan & monitoring HRD</p>
        <form onSubmit={submit} className="form">
          <Input label="Email" type="email" name="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="alert alert-error">{error}</div>}
          <Button type="submit" loading={loading} className="btn-block">
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
