import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '../../api';
import type { Attendance, AttendanceStatusFilter } from '../../api/types';
import { AttendanceStatus, formatMinutes } from '../../components/AttendanceStatus';
import { Pagination } from '../../components/DataTable';
import { PhotoThumb } from '../../components/PhotoUpload';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { Icon } from '../../components/icons';
import { usePaginated } from '../../hooks';
import { addDays, formatDate, formatTime, minutesBetween, startOfWeek, toDateInput } from '../../utils';

const LIMIT = 10;

type Preset = 'all' | 'week' | 'month' | '30d' | 'custom';
type StatusTab = AttendanceStatusFilter | '';

const PRESETS: { key: Exclude<Preset, 'custom'>; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'week', label: 'Minggu ini' },
  { key: 'month', label: 'Bulan ini' },
  { key: '30d', label: '30 hari terakhir' },
];

const STATUS_TABS: { key: StatusTab; label: string; tone: string }[] = [
  { key: '', label: 'Semua', tone: 'neutral' },
  { key: 'ON_TIME', label: 'Tepat waktu', tone: 'success' },
  { key: 'LATE', label: 'Terlambat', tone: 'danger' },
  { key: 'EARLY_LEAVE', label: 'Pulang cepat', tone: 'warning' },
];

function presetRange(p: Preset) {
  const today = new Date();
  const end = toDateInput(today);
  if (p === 'week') return { startDate: toDateInput(startOfWeek(today)), endDate: end };
  if (p === 'month') return { startDate: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: end };
  if (p === '30d') return { startDate: toDateInput(addDays(today, -29)), endDate: end };
  return { startDate: '', endDate: '' };
}

const monthLabel = (d: string) => new Date(d).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export function HistoryPage() {
  const [preset, setPreset] = useState<Preset>('all');
  const [range, setRange] = useState(presetRange('all'));
  const [status, setStatus] = useState<StatusTab>('');
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const list = usePaginated(attendanceApi.mine, { ...range, status: status || undefined, page, limit: LIMIT });

  // Jumlah per status untuk rentang tanggal yang dipilih (ditampilkan di tab)
  useEffect(() => {
    setCounts({});
    Promise.all(STATUS_TABS.map((t) => attendanceApi.mine({ ...range, status: t.key || undefined, limit: 1 })))
      .then((res) => setCounts(Object.fromEntries(STATUS_TABS.map((t, i) => [t.key, res[i].total]))))
      .catch(() => undefined);
  }, [range]);

  const choosePreset = (p: Preset) => {
    setPreset(p);
    setRange(presetRange(p));
    setPage(1);
  };
  const setCustom = (r: typeof range) => {
    setPreset('custom');
    setRange(r);
    setPage(1);
  };
  const resetFilters = () => {
    choosePreset('all');
    setStatus('');
  };
  const filtered = preset !== 'all' || !!status;

  // Kelompokkan per bulan agar riwayat panjang mudah dipindai
  const groups: { month: string; rows: Attendance[] }[] = [];
  for (const a of list.data) {
    const m = monthLabel(a.checkInAt);
    const g = groups[groups.length - 1];
    if (g?.month === m) g.rows.push(a);
    else groups.push({ month: m, rows: [a] });
  }

  return (
    <>
      <PageHeader title="Riwayat Absensi" subtitle="Semua absensi WFH yang sudah Anda submit" icon="calendar-check" />

      <Card>
        <div className="history-filters">
          <div className="status-tabs" role="tablist" aria-label="Filter status">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key || 'all'}
                type="button"
                role="tab"
                aria-selected={status === t.key}
                className={`status-tab status-tab-${t.tone} ${status === t.key ? 'status-tab-active' : ''}`}
                onClick={() => {
                  setStatus(t.key);
                  setPage(1);
                }}
              >
                {t.label}
                <span className="status-tab-count">{counts[t.key] ?? '…'}</span>
              </button>
            ))}
          </div>

          <div className="period-row">
            <div className="chip-group" role="group" aria-label="Periode">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`chip ${preset === p.key ? 'chip-active' : ''}`}
                  aria-pressed={preset === p.key}
                  onClick={() => choosePreset(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className={`date-range ${preset === 'custom' ? 'date-range-active' : ''}`}>
              <input
                type="date"
                aria-label="Dari tanggal"
                value={range.startDate}
                max={range.endDate || undefined}
                onChange={(e) => setCustom({ ...range, startDate: e.target.value })}
              />
              <span className="muted">–</span>
              <input
                type="date"
                aria-label="Sampai tanggal"
                value={range.endDate}
                min={range.startDate || undefined}
                onChange={(e) => setCustom({ ...range, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {list.error && (
          <div className="alert alert-error">
            <Icon name="alert-triangle" size={16} />
            {list.error}
          </div>
        )}

        {list.loading ? (
          <ul className="history-list" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="history-item">
                <span className="skeleton-bar history-skel-date" />
                <span className="history-body">
                  <span className="skeleton-bar" style={{ width: '40%' }} />
                  <span className="skeleton-bar" style={{ width: '65%' }} />
                </span>
              </li>
            ))}
          </ul>
        ) : list.data.length === 0 ? (
          <div className="history-empty">
            <EmptyState
              icon={filtered ? 'filter' : 'calendar-check'}
              title={filtered ? 'Tidak ada absensi pada filter ini' : 'Belum ada riwayat absensi'}
              hint={filtered ? 'Coba pilih periode lain atau status "Semua".' : 'Riwayat akan muncul setelah Anda melakukan absen pertama.'}
              action={
                filtered ? (
                  <Button size="sm" variant="secondary" icon="x" onClick={resetFilters}>
                    Reset filter
                  </Button>
                ) : (
                  <Link to="/employee" className="btn btn-primary btn-sm">
                    <Icon name="camera" size={15} /> Absen sekarang
                  </Link>
                )
              }
            />
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.month} className="history-group">
              <h3 className="history-month">{g.month}</h3>
              <ul className="history-list">
                {g.rows.map((a) => (
                  <HistoryItem key={a.id} a={a} />
                ))}
              </ul>
            </section>
          ))
        )}

        <Pagination page={page} limit={LIMIT} total={list.total} onChange={setPage} />
      </Card>
    </>
  );
}

function HistoryItem({ a }: { a: Attendance }) {
  const d = new Date(a.checkInAt);
  return (
    <li className="history-item">
      <div className="history-date">
        <strong>{d.getDate()}</strong>
        <small>{d.toLocaleDateString('id-ID', { weekday: 'short' })}</small>
      </div>
      <div className="history-body">
        <div className="history-times">
          <span>
            <Icon name="clock" size={14} /> {formatTime(a.checkInAt)}
          </span>
          <Icon name="chevron-right" size={14} className="muted" />
          <span>{a.checkOutAt ? formatTime(a.checkOutAt) : <span className="muted">--:--</span>}</span>
          {a.checkOutAt && <span className="history-duration">{formatMinutes(minutesBetween(a.checkInAt, a.checkOutAt))}</span>}
        </div>
        <AttendanceStatus a={a} />
        {a.notes && <p className="history-notes">{a.notes}</p>}
      </div>
      <PhotoThumb path={a.photoPath} title={`Bukti WFH ${formatDate(a.checkInAt)}`} />
    </li>
  );
}
