import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi, employeeApi } from '../../api';
import type { Attendance } from '../../api/types';
import { DataTable, type Column } from '../../components/DataTable';
import { AttendanceStatus } from '../../components/AttendanceStatus';
import { PhotoThumb } from '../../components/PhotoUpload';
import { Card, PageHeader, StatCard } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate, formatTime, toDateInput } from '../../utils';

export function DashboardPage() {
  const notify = useToast();
  const [stats, setStats] = useState({ employees: 0, today: 0, late: 0 });
  const [latest, setLatest] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = toDateInput(new Date());
    Promise.all([
      employeeApi.list({ limit: 1 }),
      attendanceApi.list({ startDate: today, endDate: today, limit: 5 }),
      attendanceApi.list({ startDate: today, endDate: today, status: 'LATE', limit: 1 }),
    ])
      .then(([emp, att, late]) => {
        setStats({ employees: emp.total, today: att.total, late: late.total });
        setLatest(att.data);
      })
      .catch((e) => notify('error', errorMessage(e)))
      .finally(() => setLoading(false));
  }, [notify]);

  const notYet = Math.max(stats.employees - stats.today, 0);
  const columns: Column<Attendance>[] = [
    { header: 'Karyawan', render: (a) => <EmployeeCell a={a} /> },
    { header: 'Jam Absen', render: (a) => formatTime(a.checkInAt) },
    { header: 'Jam Pulang', render: (a) => (a.checkOutAt ? formatTime(a.checkOutAt) : <span className="muted">-</span>) },
    { header: 'Status', render: (a) => <AttendanceStatus a={a} /> },
    { header: 'Foto', render: (a) => <PhotoThumb path={a.photoPath} title={`Bukti WFH ${a.employee?.fullName ?? ''}`} /> },
  ];

  return (
    <>
      <PageHeader title="Dashboard HRD" subtitle={formatDate(new Date())} />
      <div className="stats">
        <StatCard label="Total Karyawan" value={loading ? '…' : stats.employees} />
        <StatCard label="Sudah Absen Hari Ini" value={loading ? '…' : stats.today} />
        <StatCard label="Belum Absen" value={loading ? '…' : notYet} hint="termasuk karyawan nonaktif" />
        <StatCard label="Terlambat Hari Ini" value={loading ? '…' : stats.late} />
      </div>
      <Card title="Absensi Terbaru Hari Ini" actions={<Link to="/admin/attendances">Lihat semua →</Link>}>
        <DataTable columns={columns} rows={latest} rowKey={(a) => a.id} loading={loading} emptyText="Belum ada karyawan yang absen hari ini" />
      </Card>
    </>
  );
}

export function EmployeeCell({ a }: { a: Attendance }) {
  return (
    <div className="stack">
      <strong>{a.employee?.fullName ?? '-'}</strong>
      <small className="muted">
        {a.employee?.nik} · {a.employee?.department}
      </small>
    </div>
  );
}
