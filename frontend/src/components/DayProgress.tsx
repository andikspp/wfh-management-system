import { useEffect, useState } from 'react';
import type { Attendance } from '../api/types';
import { formatMinutes } from './AttendanceStatus';
import { Icon, type IconName } from './icons';
import { formatTime } from '../utils';

type StepState = 'done' | 'current' | 'todo';

/** Alur kerja harian karyawan: absen masuk -> bekerja -> clock out */
export function DayProgress({ today }: { today: Attendance | null }) {
  const [now, setNow] = useState(() => Date.now());
  const working = !!today && !today.checkOutAt;

  // Durasi kerja diperbarui tiap 30 detik selama belum clock out
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [working]);

  const end = today?.checkOutAt ? new Date(today.checkOutAt).getTime() : now;
  const minutes = today ? Math.max(Math.floor((end - new Date(today.checkInAt).getTime()) / 60_000), 0) : 0;

  const steps: { label: string; detail: string; icon: IconName; state: StepState }[] = [
    {
      label: 'Absen masuk',
      detail: today ? formatTime(today.checkInAt) : 'Upload foto bukti WFH',
      icon: 'camera',
      state: today ? 'done' : 'current',
    },
    {
      label: 'Bekerja',
      detail: today ? formatMinutes(minutes) : '-',
      icon: 'clock',
      state: !today ? 'todo' : working ? 'current' : 'done',
    },
    {
      label: 'Clock out',
      detail: today?.checkOutAt ? formatTime(today.checkOutAt) : 'Saat selesai bekerja',
      icon: 'logout',
      state: today?.checkOutAt ? 'done' : 'todo',
    },
  ];

  return (
    <ol className="day-progress" aria-label="Progres absensi hari ini">
      {steps.map((s) => (
        <li key={s.label} className={`day-step day-step-${s.state}`}>
          <span className="day-step-dot">
            <Icon name={s.state === 'done' ? 'check-circle' : s.icon} size={18} />
          </span>
          <span className="day-step-text">
            <strong>{s.label}</strong>
            <small className="muted">{s.detail}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}
