import { useState } from 'react';
import { employeeApi } from '../../api';
import type { Employee } from '../../api/types';
import { DataTable, Pagination, type Column } from '../../components/DataTable';
import { Badge, Button, Card, ConfirmDialog, PageHeader } from '../../components/ui';
import { Icon } from '../../components/icons';
import { useToast } from '../../context/ToastContext';
import { useDebounced, usePaginated } from '../../hooks';
import { errorMessage, formatShortDate } from '../../utils';
import { EmployeeFormModal } from './EmployeeFormModal';

const LIMIT = 10;

export function EmployeesPage() {
  const notify = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);
  const list = usePaginated(employeeApi.list, { search: debouncedSearch, page, limit: LIMIT });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await employeeApi.remove(deleting.id);
      notify('success', `${deleting.fullName} dihapus`);
      setDeleting(null);
      // Mundur satu halaman bila baris terakhir di halaman ini terhapus
      if (list.data.length === 1 && page > 1) setPage(page - 1);
      else list.reload();
    } catch (err) {
      notify('error', errorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Employee>[] = [
    { header: 'NIK', render: (e) => <code>{e.nik}</code> },
    {
      header: 'Nama',
      render: (e) => (
        <div className="stack">
          <strong>{e.fullName}</strong>
          <small className="muted">{e.email}</small>
        </div>
      ),
    },
    {
      header: 'Jabatan',
      render: (e) => (
        <div className="stack">
          <span>{e.position}</span>
          <small className="muted">{e.department}</small>
        </div>
      ),
    },
    { header: 'Telepon', render: (e) => e.phone || <span className="muted">-</span> },
    { header: 'Bergabung', render: (e) => formatShortDate(e.joinDate) },
    { header: 'Status', render: (e) => (e.isActive ? <Badge tone="success">Aktif</Badge> : <Badge>Nonaktif</Badge>) },
    {
      header: 'Aksi',
      className: 'col-actions',
      render: (e) => (
        <div className="row-actions">
          <Button size="sm" variant="secondary" icon="pencil" onClick={() => openEdit(e)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" icon="trash" className="text-danger" onClick={() => setDeleting(e)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Data Karyawan"
        subtitle="Kelola master data karyawan"
        icon="users"
        actions={
          <Button icon="plus" onClick={openCreate}>
            Tambah Karyawan
          </Button>
        }
      />
      <Card>
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={16} />
            <input
              className="search"
              type="search"
              placeholder="Cari nama, NIK, email, departemen…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        {list.error && (
          <div className="alert alert-error">
            <Icon name="alert-triangle" size={16} />
            {list.error}
          </div>
        )}
        <DataTable
          columns={columns}
          rows={list.data}
          rowKey={(e) => e.id}
          loading={list.loading}
          emptyText={debouncedSearch ? `Tidak ada karyawan yang cocok dengan "${debouncedSearch}"` : 'Belum ada data karyawan'}
          emptyHint={debouncedSearch ? 'Coba kata kunci lain, misalnya NIK atau nama departemen.' : 'Tambahkan karyawan pertama agar mereka bisa mulai absen.'}
          emptyIcon={debouncedSearch ? 'search' : 'user-x'}
          emptyAction={
            debouncedSearch ? (
              <Button size="sm" variant="secondary" icon="x" onClick={() => setSearch('')}>
                Hapus pencarian
              </Button>
            ) : (
              <Button size="sm" icon="plus" onClick={openCreate}>
                Tambah Karyawan
              </Button>
            )
          }
        />
        <Pagination page={page} limit={LIMIT} total={list.total} onChange={setPage} />
      </Card>

      <EmployeeFormModal open={formOpen} employee={editing} onClose={() => setFormOpen(false)} onSaved={list.reload} />
      <ConfirmDialog
        open={!!deleting}
        title="Hapus Karyawan"
        message={
          <>
            Hapus <strong>{deleting?.fullName}</strong>? Akun login dan seluruh riwayat absensinya juga akan terhapus.
          </>
        }
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
