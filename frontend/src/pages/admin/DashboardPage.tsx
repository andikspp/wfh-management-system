import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi, employeeApi } from '../../api';
import type { Attendance } from '../../api/types';
import { DataTable, type Column } from '../../components/DataTable';
import { PhotoThumb } from '../../components/PhotoUpload';
import { Card, PageHeader, StatCard } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate, formatTime, toDateInput } from '../../utils';

export function DashboardPage() {
  const notify = useToast();
  const [stats, setStats] = useState({ employees: 0, today: 0 });
  const [latest, setLatest] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = toDateInput(new Date());
    Promise.all([employeeApi.list({ limit: 1 }), attendanceApi.list({ startDate: today, endDate: today, limit: 5 })])
      .then(([emp, att]) => {
        setStats({ employees: emp.total, today: att.total });
        setLatest(att.data);
      })
      .catch((e) => notify('error', errorMessage(e)))
      .finally(() => setLoading(false));
  }, [notify]);

  const notYet = Math.max(stats.employees - stats.today, 0);
  const columns: Column<Attendance>[] = [
    { header: 'Karyawan', render: (a) => <EmployeeCell a={a} /> },
    { header: 'Jam Absen', render: (a) => formatTime(a.checkInAt) },
    { header: 'Foto', render: (a) => <PhotoThumb path={a.photoPath} title={`Bukti WFH ${a.employee?.fullName ?? ''}`} /> },
  ];

  return (
    <>
      <PageHeader title="Dashboard HRD" subtitle={formatDate(new Date())} />
      <div className="stats">
        <StatCard label="Total Karyawan" value={loading ? '…' : stats.employees} />
        <StatCard label="Sudah Absen Hari Ini" value={loading ? '…' : stats.today} />
        <StatCard label="Belum Absen" value={loading ? '…' : notYet} hint="termasuk karyawan nonaktif" />
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
