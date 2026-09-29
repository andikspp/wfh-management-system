import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { attendanceApi } from '../../api';
import type { WorkScheduleInput } from '../../api/types';
import { Button, Card, Input, PageHeader, PageLoader } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatShortDate, formatTime } from '../../utils';

/** Pengaturan jam kerja yang dipakai untuk menentukan status terlambat & pulang cepat */
export function SettingsPage() {
  const notify = useToast();
  const [form, setForm] = useState<WorkScheduleInput>({ checkInTime: '', checkOutTime: '', lateToleranceMinutes: 0 });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceApi
      .schedule()
      .then(({ updatedAt, ...s }) => {
        setForm(s);
        setUpdatedAt(updatedAt);
      })
      .catch((e) => notify('error', errorMessage(e)))
      .finally(() => setLoading(false));
  }, [notify]);

  const set = (k: keyof WorkScheduleInput) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'lateToleranceMinutes' ? Number(e.target.value) : e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.checkInTime || !form.checkOutTime) return setError('Jam masuk dan jam pulang wajib diisi');
    if (form.checkOutTime <= form.checkInTime) return setError('Jam pulang harus setelah jam masuk');
    setError('');
    setSaving(true);
    try {
      const { updatedAt, ...s } = await attendanceApi.updateSchedule(form);
      setForm(s);
      setUpdatedAt(updatedAt);
      notify('success', 'Jam kerja berhasil disimpan');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Jam Kerja" subtitle="Dipakai untuk menentukan status terlambat dan pulang cepat karyawan" />
      <Card>
        <form onSubmit={submit} className="form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <Input label="Jam masuk" name="checkInTime" type="time" required value={form.checkInTime} onChange={set('checkInTime')} />
            <Input label="Jam pulang" name="checkOutTime" type="time" required value={form.checkOutTime} onChange={set('checkOutTime')} />
            <Input
              label="Toleransi terlambat (menit)"
              name="lateToleranceMinutes"
              type="number"
              min={0}
              max={240}
              required
              value={form.lateToleranceMinutes}
              onChange={set('lateToleranceMinutes')}
            />
          </div>
          <p className="muted small">
            Absen masuk lewat dari jam masuk + toleransi dihitung <strong>terlambat</strong>; clock out sebelum jam pulang dihitung{' '}
            <strong>pulang cepat</strong>. Perubahan hanya berlaku untuk absensi berikutnya, riwayat yang sudah ada tidak berubah.
          </p>
          <div className="form-actions">
            {updatedAt && (
              <span className="muted small">
                Terakhir diubah {formatShortDate(updatedAt)} {formatTime(updatedAt)}
              </span>
            )}
            <Button type="submit" loading={saving}>
              Simpan
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
