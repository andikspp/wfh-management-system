import { Button } from './ui';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface Props extends DateRange {
  onChange: (range: DateRange) => void;
  search?: string;
  onSearch?: (value: string) => void;
}

/** Filter rentang tanggal (+ pencarian opsional) untuk daftar absensi */
export function AttendanceFilters({ startDate, endDate, onChange, search, onSearch }: Props) {
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
      {(startDate || endDate || search) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange({ startDate: '', endDate: '' });
            onSearch?.('');
          }}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
