import type { Attendance } from '../api/types';
import { Badge } from './ui';

/** Durasi menit -> "1 j 5 mnt" / "20 mnt" */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h} j${m ? ` ${m} mnt` : ''}` : `${m} mnt`;
}

/** Badge status kehadiran: terlambat, pulang cepat, tepat waktu, belum clock out */
export function AttendanceStatus({ a }: { a: Attendance }) {
  const onTime = a.lateMinutes === 0 && a.earlyLeaveMinutes === 0;
  return (
    <div className="badges">
      {a.lateMinutes > 0 && <Badge tone="danger">Terlambat {formatMinutes(a.lateMinutes)}</Badge>}
      {a.earlyLeaveMinutes > 0 && <Badge tone="warning">Pulang cepat {formatMinutes(a.earlyLeaveMinutes)}</Badge>}
      {onTime && <Badge tone="success">Tepat waktu</Badge>}
      {!a.checkOutAt && <Badge>Belum clock out</Badge>}
    </div>
  );
}
