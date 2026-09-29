import type { ReactNode } from 'react';
import { EmptyState } from './ui';
import { Icon, type IconName } from './icons';

export interface Column<T> {
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: IconName;
  emptyHint?: string;
  emptyAction?: ReactNode;
}

/** Tabel generik; di layar kecil tiap baris tampil sebagai kartu (lihat .table di CSS) */
export function DataTable<T>({ columns, rows, rowKey, loading, emptyText = 'Belum ada data', emptyIcon, emptyHint, emptyAction }: Props<T>) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header} className={c.className}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="skeleton-row" aria-hidden="true">
                {columns.map((c) => (
                  <td key={c.header} className={c.className}>
                    <span className="skeleton-bar" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-state">
                <EmptyState icon={emptyIcon} title={emptyText} hint={emptyHint} action={emptyAction} />
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row)}>
                {columns.map((c) => (
                  <td key={c.header} className={c.className} data-label={c.header}>
                    {c.render(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, limit, total, onChange }: { page: number; limit: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="pagination">
      <span className="muted">
        {from}–{to} dari {total} data
      </span>
      <div className="pagination-controls">
        <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Icon name="chevron-left" size={15} /> Sebelumnya
        </button>
        <span>
          {page} / {pages}
        </span>
        <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Berikutnya <Icon name="chevron-right" size={15} />
        </button>
      </div>
    </div>
  );
}
