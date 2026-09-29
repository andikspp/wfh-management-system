import { useState } from 'react';
import { attendanceApi } from '../../api';
import type { Attendance, AttendanceStatusFilter } from '../../api/types';
import { AttendanceFilters, type DateRange } from '../../components/AttendanceFilters';
import { DataTable, Pagination, type Column } from '../../components/DataTable';
import { AttendanceStatus } from '../../components/AttendanceStatus';
import { PhotoThumb } from '../../components/PhotoUpload';
import { Button, Card, PageHeader } from '../../components/ui';
import { Icon } from '../../components/icons';
import { useDebounced, usePaginated } from '../../hooks';
import { formatShortDate, formatTime } from '../../utils';
import { EmployeeCell } from './DashboardPage';

const LIMIT = 10;

/** Monitoring absensi seluruh karyawan (view only) */
export function AttendancesPage() {
  const [range, setRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AttendanceStatusFilter | ''>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);
  const list = usePaginated(attendanceApi.list, { ...range, status: status || undefined, search: debouncedSearch, page, limit: LIMIT });

  const filtered = !!(range.startDate || range.endDate || status || debouncedSearch);
  const resetFilters = () => {
    setRange({ startDate: '', endDate: '' });
    setStatus('');
    setSearch('');
    setPage(1);
  };

  const columns: Column<Attendance>[] = [
    { header: 'No', render: (_a, i) => (page - 1) * LIMIT + i + 1, className: 'col-narrow' },
    { header: 'Karyawan', render: (a) => <EmployeeCell a={a} /> },
    { header: 'Tanggal', render: (a) => formatShortDate(a.checkInAt) },
    { header: 'Jam Absen', render: (a) => formatTime(a.checkInAt) },
    { header: 'Jam Pulang', render: (a) => (a.checkOutAt ? formatTime(a.checkOutAt) : <span className="muted">-</span>) },
    { header: 'Status', render: (a) => <AttendanceStatus a={a} /> },
    { header: 'Catatan', render: (a) => a.notes || <span className="muted">-</span> },
    { header: 'Foto', render: (a) => <PhotoThumb path={a.photoPath} title={`Bukti WFH ${a.employee?.fullName ?? ''} — ${formatShortDate(a.checkInAt)}`} /> },
  ];

  return (
    <>
      <PageHeader title="Monitoring Absensi" subtitle="Data absensi WFH yang disubmit karyawan" icon="calendar-check" />
      <Card>
        <AttendanceFilters
          {...range}
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
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
        {list.error && (
          <div className="alert alert-error">
            <Icon name="alert-triangle" size={16} />
            {list.error}
          </div>
        )}
        <DataTable
          columns={columns}
          rows={list.data}
          rowKey={(a) => a.id}
          loading={list.loading}
          emptyText={filtered ? 'Tidak ada absensi yang sesuai filter' : 'Belum ada absensi yang disubmit'}
          emptyHint={filtered ? 'Coba perlebar rentang tanggal atau ubah status.' : undefined}
          emptyIcon={filtered ? 'filter' : 'calendar-check'}
          emptyAction={
            filtered && (
              <Button size="sm" variant="secondary" icon="x" onClick={resetFilters}>
                Reset filter
              </Button>
            )
          }
        />
        <Pagination page={page} limit={LIMIT} total={list.total} onChange={setPage} />
      </Card>
    </>
  );
}
