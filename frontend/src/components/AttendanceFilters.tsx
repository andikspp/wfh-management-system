import type { AttendanceStatusFilter } from '../api/types';
import { Button } from './ui';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface Props extends DateRange {
  onChange: (range: DateRange) => void;
  search?: string;
  onSearch?: (value: string) => void;
  status?: AttendanceStatusFilter | '';
  onStatus?: (value: AttendanceStatusFilter | '') => void;
}

/** Filter rentang tanggal (+ pencarian opsional) untuk daftar absensi */
export function AttendanceFilters({ startDate, endDate, onChange, search, onSearch, status, onStatus }: Props) {
  return (
    <div className="toolbar">
      {onSearch && (
        <input className="search" type="search" placeholder="Cari nama / NIK…" value={search} onChange={(e) => onSearch(e.target.value)} />
      )}
      <label className="inline-field">
        <span>Dari</span>
        <input type="date" value={startDate} max={endDate || undefined} onChange={(e) => onChange({ startDate: e.target.value, endDate })} />
      </label>
      <label className="inline-field">
        <span>Sampai</span>
        <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => onChange({ startDate, endDate: e.target.value })} />
      </label>
      {onStatus && (
        <label className="inline-field">
          <span>Status</span>
          <select value={status} onChange={(e) => onStatus(e.target.value as AttendanceStatusFilter | '')}>
            <option value="">Semua</option>
            <option value="ON_TIME">Tepat waktu</option>
            <option value="LATE">Terlambat</option>
            <option value="EARLY_LEAVE">Pulang cepat</option>
          </select>
        </label>
      )}
      {(startDate || endDate || search || status) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange({ startDate: '', endDate: '' });
            onSearch?.('');
            onStatus?.('');
          }}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
