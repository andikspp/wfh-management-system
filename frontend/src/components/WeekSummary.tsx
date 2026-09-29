import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '../api';
import type { Attendance } from '../api/types';
import { addDays, startOfWeek, toDateInput } from '../utils';
import { Icon } from './icons';
import { Card, Spinner } from './ui';

type DayState = 'ontime' | 'late' | 'early' | 'absent' | 'today' | 'future';

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
const STATE_LABEL: Record<DayState, string> = {
  ontime: 'Tepat waktu',
  late: 'Terlambat',
  early: 'Pulang cepat',
  absent: 'Tidak absen',
  today: 'Hari ini',
  future: 'Belum tiba',
};

/** Rekap Senin–Jumat minggu ini; `refreshKey` berubah setiap absen/clock out agar data ikut diperbarui */
export function WeekSummary({ refreshKey }: { refreshKey: string }) {
  const [rows, setRows] = useState<Attendance[] | null>(null);
  const now = new Date();
  const monday = startOfWeek(now);
  const todayStr = toDateInput(now);

  useEffect(() => {
    attendanceApi
      .mine({ startDate: toDateInput(monday), endDate: toDateInput(addDays(monday, 6)), limit: 7 })
      .then((r) => setRows(r.data))
      .catch(() => setRows([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const days = DAY_LABELS.map((label, i) => {
    const date = addDays(monday, i);
    const key = toDateInput(date);
    const a = rows?.find((r) => r.attendanceDate.slice(0, 10) === key);
    let state: DayState;
    if (a) state = a.lateMinutes > 0 ? 'late' : a.earlyLeaveMinutes > 0 ? 'early' : 'ontime';
    else if (key === todayStr) state = 'today';
    else state = key < todayStr ? 'absent' : 'future';
    return { label, date: date.getDate(), state, isToday: key === todayStr };
  });

  const present = rows?.length ?? 0;
  const late = rows?.filter((r) => r.lateMinutes > 0).length ?? 0;

  return (
    <Card
      title="Minggu Ini"
      actions={
        <Link to="/employee/history" className="link-arrow">
          Riwayat <Icon name="chevron-right" size={15} />
        </Link>
      }
    >
      {rows === null ? (
        <div className="week-loading">
          <Spinner />
        </div>
      ) : (
        <>
          <ol className="week-strip">
            {days.map((d) => (
              <li key={d.label} className={`week-day week-${d.state} ${d.isToday ? 'week-is-today' : ''}`} title={STATE_LABEL[d.state]}>
                <span className="week-day-name">{d.label}</span>
                <span className="week-day-dot">
                  {d.state === 'ontime' || d.state === 'early' ? (
                    <Icon name="check-circle" size={16} />
                  ) : d.state === 'late' ? (
                    <Icon name="clock" size={16} />
                  ) : d.state === 'absent' ? (
                    <Icon name="x" size={14} />
                  ) : (
                    d.date
                  )}
                </span>
              </li>
            ))}
          </ol>
          <div className="week-stats">
            <div>
              <strong>{present}</strong>
              <small className="muted">hari absen</small>
            </div>
            <div>
              <strong>{present - late}</strong>
              <small className="muted">tepat masuk</small>
            </div>
            <div>
              <strong className={late ? 'text-danger' : ''}>{late}</strong>
              <small className="muted">terlambat</small>
            </div>
          </div>
          <ul className="week-legend">
            <li><span className="legend-dot legend-ontime" /> Tepat waktu</li>
            <li><span className="legend-dot legend-late" /> Terlambat</li>
            <li><span className="legend-dot legend-early" /> Pulang cepat</li>
            <li><span className="legend-dot legend-absent" /> Tidak absen</li>
          </ul>
        </>
      )}
    </Card>
  );
}
