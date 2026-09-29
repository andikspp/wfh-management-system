import { useEffect, useState, type FormEvent } from 'react';
import { attendanceApi } from '../../api';
import type { WorkScheduleInput } from '../../api/types';
import { formatMinutes } from '../../components/AttendanceStatus';
import { Badge, Button, Card, PageHeader, PageLoader } from '../../components/ui';
import { Icon } from '../../components/icons';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatShortDate, formatTime } from '../../utils';

const EMPTY: WorkScheduleInput = { checkInTime: '', checkOutTime: '', lateToleranceMinutes: 0 };
const TOLERANCE_PRESETS = [0, 5, 10, 15, 30];

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toTime = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Pengaturan jam kerja yang dipakai untuk menentukan status terlambat & pulang cepat */
export function SettingsPage() {
  const notify = useToast();
  const [saved, setSaved] = useState<WorkScheduleInput>(EMPTY);
  const [form, setForm] = useState<WorkScheduleInput>(EMPTY);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceApi
      .schedule()
      .then(({ updatedAt, ...s }) => {
        setSaved(s);
        setForm(s);
        setUpdatedAt(updatedAt);
      })
      .catch((e) => notify('error', errorMessage(e)))
      .finally(() => setLoading(false));
  }, [notify]);

  const set = <K extends keyof WorkScheduleInput>(k: K, v: WorkScheduleInput[K]) => {
    setError('');
    setForm((f) => ({ ...f, [k]: v }));
  };

  const complete = !!form.checkInTime && !!form.checkOutTime;
  const workMinutes = complete ? toMinutes(form.checkOutTime) - toMinutes(form.checkInTime) : 0;
  const timeError = complete && workMinutes <= 0 ? 'Jam pulang harus setelah jam masuk' : '';
  const toleranceError =
    !Number.isInteger(form.lateToleranceMinutes) || form.lateToleranceMinutes < 0 || form.lateToleranceMinutes > 240
      ? 'Toleransi harus 0–240 menit'
      : '';
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const valid = complete && !timeError && !toleranceError;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return setError(timeError || toleranceError || 'Jam masuk dan jam pulang wajib diisi');
    setSaving(true);
    try {
      const { updatedAt, ...s } = await attendanceApi.updateSchedule(form);
      setSaved(s);
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
      <PageHeader title="Jam Kerja" subtitle="Pengaturan jam kerja karyawan" icon="clock" />
      <div className="settings-layout">
        <form onSubmit={submit} className="card settings-form" noValidate>
          {error && (
            <div className="alert alert-error">
              <Icon name="alert-triangle" size={16} />
              {error}
            </div>
          )}

          <section className="settings-section">
            <div className="settings-section-head">
              <h2>Jam kerja harian</h2>
              <p className="muted small">Berlaku untuk semua karyawan, Senin–Jumat.</p>
            </div>
            <div className="time-range">
              <div className="field">
                <label htmlFor="checkInTime">Jam masuk</label>
                <input
                  id="checkInTime"
                  type="time"
                  value={form.checkInTime}
                  onChange={(e) => set('checkInTime', e.target.value)}
                  className={timeError ? 'invalid' : ''}
                />
              </div>
              <span className="time-range-arrow" aria-hidden>
                <Icon name="chevron-right" size={18} />
              </span>
              <div className="field">
                <label htmlFor="checkOutTime">Jam pulang</label>
                <input
                  id="checkOutTime"
                  type="time"
                  value={form.checkOutTime}
                  onChange={(e) => set('checkOutTime', e.target.value)}
                  className={timeError ? 'invalid' : ''}
                />
              </div>
            </div>
            {timeError ? (
              <small className="field-error">{timeError}</small>
            ) : (
              complete && (
                <small className="muted">
                  Durasi kerja <strong>{formatMinutes(workMinutes)}</strong>
                </small>
              )
            )}
          </section>

          <section className="settings-section">
            <div className="settings-section-head">
              <h2>Toleransi keterlambatan</h2>
              <p className="muted small">Masa tenggang setelah jam masuk sebelum absen dihitung terlambat.</p>
            </div>
            <div className="chip-group" role="group" aria-label="Pilihan cepat toleransi">
              {TOLERANCE_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip ${form.lateToleranceMinutes === m ? 'chip-active' : ''}`}
                  aria-pressed={form.lateToleranceMinutes === m}
                  onClick={() => set('lateToleranceMinutes', m)}
                >
                  {m === 0 ? 'Tanpa toleransi' : `${m} menit`}
                </button>
              ))}
            </div>
            <div className="field tolerance-field">
              <label htmlFor="lateToleranceMinutes">Atau isi sendiri</label>
              <div className="input-suffix">
                <input
                  id="lateToleranceMinutes"
                  type="number"
                  min={0}
                  max={240}
                  value={Number.isNaN(form.lateToleranceMinutes) ? '' : form.lateToleranceMinutes}
                  onChange={(e) => set('lateToleranceMinutes', e.target.value === '' ? NaN : Number(e.target.value))}
                  className={toleranceError ? 'invalid' : ''}
                />
                <span>menit</span>
              </div>
              {toleranceError && <small className="field-error">{toleranceError}</small>}
            </div>
          </section>

          <div className="settings-footer">
            <span className="muted small">
              {updatedAt ? `Terakhir diubah ${formatShortDate(updatedAt)}, ${formatTime(updatedAt)}` : 'Masih memakai jam kerja default'}
            </span>
            <div className="form-actions">
              {dirty && (
                <Button variant="ghost" onClick={() => { setForm(saved); setError(''); }} disabled={saving}>
                  Batalkan
                </Button>
              )}
              <Button type="submit" icon="check-circle" loading={saving} disabled={!dirty || !valid}>
                Simpan perubahan
              </Button>
            </div>
          </div>
        </form>

        <SchedulePreview schedule={valid ? form : null} dirty={dirty} />
      </div>
    </>
  );
}

/** Contoh penerapan aturan dengan nilai yang sedang diisi, agar HRD paham dampaknya sebelum menyimpan */
function SchedulePreview({ schedule, dirty }: { schedule: WorkScheduleInput | null; dirty: boolean }) {
  if (!schedule) {
    return (
      <Card title="Pratinjau">
        <p className="muted small">Lengkapi jam masuk dan jam pulang untuk melihat pratinjau.</p>
      </Card>
    );
  }
  const start = toMinutes(schedule.checkInTime);
  const end = toMinutes(schedule.checkOutTime);
  const tol = schedule.lateToleranceMinutes;
  const lateAt = start + tol + 5;
  const tolPct = Math.min((tol / (end - start)) * 100, 100);

  const examples = [
    { time: toTime(start + Math.floor(tol / 2)), label: 'Absen masuk', result: <Badge tone="success">Tepat waktu</Badge> },
    { time: toTime(lateAt), label: 'Absen masuk', result: <Badge tone="danger">Terlambat {formatMinutes(lateAt - start)}</Badge> },
    { time: toTime(end - 30), label: 'Clock out', result: <Badge tone="warning">Pulang cepat 30 mnt</Badge> },
    { time: toTime(end), label: 'Clock out', result: <Badge tone="success">Tepat waktu</Badge> },
  ];

  return (
    <Card title="Pratinjau" actions={dirty ? <Badge tone="info">Belum disimpan</Badge> : undefined}>
      <div className="schedule-bar" aria-hidden>
        <div className="schedule-bar-track">
          <span className="schedule-bar-tolerance" style={{ width: `${tolPct}%` }} />
        </div>
        <div className="schedule-bar-labels">
          <span>
            <strong>{schedule.checkInTime}</strong>
            <small className="muted">Masuk</small>
          </span>
          {tol > 0 && (
            <span className="schedule-bar-mid">
              <strong>{toTime(start + tol)}</strong>
              <small className="muted">Batas toleransi</small>
            </span>
          )}
          <span className="schedule-bar-end">
            <strong>{schedule.checkOutTime}</strong>
            <small className="muted">Pulang</small>
          </span>
        </div>
      </div>

      <h3 className="preview-title">Contoh penerapan</h3>
      <ul className="preview-list">
        {examples.map((ex) => (
          <li key={ex.label + ex.time}>
            <span>
              <code>{ex.time}</code> <span className="muted">{ex.label}</span>
            </span>
            {ex.result}
          </li>
        ))}
      </ul>
      <p className="muted small preview-note">
        <Icon name="clock" size={14} />
        Perubahan hanya berlaku untuk absensi berikutnya. Riwayat yang sudah tercatat tidak ikut berubah.
      </p>
    </Card>
  );
}
