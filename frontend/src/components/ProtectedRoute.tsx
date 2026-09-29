import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui';

export const homeFor = (role: Role) => (role === 'ADMIN' ? '/admin' : '/employee');

/** Hanya izinkan user login dengan role tertentu; selain itu diarahkan ulang */
export function ProtectedRoute({ role }: { role: Role }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
