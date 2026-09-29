import type { ReactNode } from 'react';
import { Spinner } from './ui';

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
}

/** Tabel generik; di layar kecil tiap baris tampil sebagai kartu (lihat .table di CSS) */
export function DataTable<T>({ columns, rows, rowKey, loading, emptyText = 'Belum ada data' }: Props<T>) {
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
            <tr>
              <td colSpan={columns.length} className="table-state">
                <Spinner />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-state">
                {emptyText}
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
          ‹ Sebelumnya
        </button>
        <span>
          {page} / {pages}
        </span>
        <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Berikutnya ›
        </button>
      </div>
    </div>
  );
}
