import { useState } from 'react';
import { attendanceApi } from '../../api';
import type { Attendance, AttendanceStatusFilter } from '../../api/types';
import { AttendanceFilters, type DateRange } from '../../components/AttendanceFilters';
import { DataTable, Pagination, type Column } from '../../components/DataTable';
import { AttendanceStatus } from '../../components/AttendanceStatus';
import { PhotoThumb } from '../../components/PhotoUpload';
import { Card, PageHeader } from '../../components/ui';
import { usePaginated } from '../../hooks';
import { formatDate, formatTime } from '../../utils';

const LIMIT = 10;

export function HistoryPage() {
  const [range, setRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [status, setStatus] = useState<AttendanceStatusFilter | ''>('');
  const [page, setPage] = useState(1);
  const list = usePaginated(attendanceApi.mine, { ...range, status: status || undefined, page, limit: LIMIT });

  const columns: Column<Attendance>[] = [
    { header: 'Tanggal', render: (a) => formatDate(a.checkInAt) },
    { header: 'Jam Absen', render: (a) => formatTime(a.checkInAt) },
    { header: 'Jam Pulang', render: (a) => (a.checkOutAt ? formatTime(a.checkOutAt) : <span className="muted">-</span>) },
    { header: 'Status', render: (a) => <AttendanceStatus a={a} /> },
    { header: 'Catatan', render: (a) => a.notes || <span className="muted">-</span> },
    { header: 'Foto', render: (a) => <PhotoThumb path={a.photoPath} title={`Bukti WFH ${formatDate(a.checkInAt)}`} /> },
  ];

  return (
    <>
      <PageHeader title="Riwayat Absensi" subtitle="Daftar absensi WFH yang sudah Anda submit" />
      <Card>
        <AttendanceFilters
          {...range}
          status={status}
          onStatus={(s) => {
            setStatus(s);
            setPage(1);
          }}
          onChange={(r) => {
            setRange(r);
            setPage(1);
          }}
        />
        {list.error && <div className="alert alert-error">{list.error}</div>}
        <DataTable columns={columns} rows={list.data} rowKey={(a) => a.id} loading={list.loading} emptyText="Belum ada riwayat absensi" />
        <Pagination page={page} limit={LIMIT} total={list.total} onChange={setPage} />
      </Card>
    </>
  );
}
