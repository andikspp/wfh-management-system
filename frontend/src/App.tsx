import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { homeFor, ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/ui';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AttendancesPage } from './pages/admin/AttendancesPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { CheckInPage } from './pages/employee/CheckInPage';
import { HistoryPage } from './pages/employee/HistoryPage';
import { LoginPage } from './pages/LoginPage';

const employeeNav = [
  { to: '/employee', label: 'Absen' },
  { to: '/employee/history', label: 'Riwayat' },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/employees', label: 'Karyawan' },
  { to: '/admin/attendances', label: 'Absensi' },
];

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute role="EMPLOYEE" />}>
              <Route path="/employee" element={<Layout nav={employeeNav} />}>
                <Route index element={<CheckInPage />} />
                <Route path="history" element={<HistoryPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" />}>
              <Route path="/admin" element={<Layout nav={adminNav} />}>
                <Route index element={<DashboardPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="attendances" element={<AttendancesPage />} />
              </Route>
            </Route>

            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
