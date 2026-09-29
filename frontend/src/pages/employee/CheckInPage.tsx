import { useEffect, useState, type FormEvent } from 'react';
import { attendanceApi } from '../../api';
import type { Attendance, WorkSchedule } from '../../api/types';
import { AttendanceStatus } from '../../components/AttendanceStatus';
import { LiveClock } from '../../components/LiveClock';
import { PhotoThumb, PhotoUpload } from '../../components/PhotoUpload';
import { Badge, Button, Card, ConfirmDialog, PageHeader, PageLoader, TextArea } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate, formatTime } from '../../utils';

export function CheckInPage() {
  const { user } = useAuth();
  const notify = useToast();
  const [today, setToday] = useState<Attendance | null>(null);
  const [schedule, setSchedule] = useState<WorkSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    Promise.all([attendanceApi.today(), attendanceApi.schedule()])
      .then(([t, s]) => {
        setToday(t.attendance);
        setSchedule(s);
      })
      .catch((e) => notify('error', errorMessage(e)))
      .finally(() => setLoading(false));
  }, [notify]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!photo) return setPhotoError('Foto bukti WFH wajib diupload');
    setPhotoError('');
    setSubmitting(true);
    try {
      setToday(await attendanceApi.checkIn(photo, notes.trim() || undefined));
      notify('success', 'Absen berhasil dicatat');
      setPhoto(null);
      setNotes('');
    } catch (err) {
      notify('error', errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const checkOut = async () => {
    setCheckingOut(true);
    try {
      setToday(await attendanceApi.checkOut());
      notify('success', 'Clock out berhasil dicatat');
    } catch (err) {
      notify('error', errorMessage(err));
    } finally {
      setCheckingOut(false);
      setConfirmOut(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title={`Halo, ${user?.name}`} subtitle={[user?.employee?.position, user?.employee?.department].filter(Boolean).join(' · ')} />
      <div className="grid-2">
        <Card title="Waktu Sekarang">
          <LiveClock />
          <div className="status-row">
            <span>Status hari ini</span>
            {!today ? (
              <Badge tone="danger">Belum absen</Badge>
            ) : today.checkOutAt ? (
              <Badge tone="success">Sudah clock out</Badge>
            ) : (
              <Badge tone="info">Sedang bekerja</Badge>
            )}
          </div>
          {schedule && (
            <div className="status-row">
              <span>Jam kerja</span>
              <span>
                {schedule.checkInTime} – {schedule.checkOutTime}
                {schedule.lateToleranceMinutes > 0 && <span className="muted"> (toleransi {schedule.lateToleranceMinutes} mnt)</span>}
              </span>
            </div>
          )}
        </Card>

        {today ? (
          <Card title="Absensi Hari Ini">
            <div className="checked-in">
              <PhotoThumb path={today.photoPath} title={`Bukti WFH ${formatDate(today.checkInAt)}`} />
              <dl className="detail-list">
                <dt>Tanggal</dt>
                <dd>{formatDate(today.checkInAt)}</dd>
                <dt>Jam absen</dt>
                <dd>{formatTime(today.checkInAt)}</dd>
                <dt>Jam pulang</dt>
                <dd>{today.checkOutAt ? formatTime(today.checkOutAt) : '-'}</dd>
                <dt>Status</dt>
                <dd>
                  <AttendanceStatus a={today} />
                </dd>
                <dt>Catatan</dt>
                <dd>{today.notes || '-'}</dd>
              </dl>
            </div>
            {today.checkOutAt ? (
              <p className="muted small">Anda sudah clock out hari ini. Terima kasih!</p>
            ) : (
              <Button onClick={() => setConfirmOut(true)} loading={checkingOut} className="btn-block">
                Clock Out
              </Button>
            )}
          </Card>
        ) : (
          <Card title="Absen WFH">
            <form onSubmit={submit} className="form">
              <PhotoUpload value={photo} onChange={(f) => { setPhoto(f); setPhotoError(''); }} error={photoError} />
              <TextArea
                label="Catatan pekerjaan (opsional)"
                name="notes"
                rows={3}
                maxLength={255}
                placeholder="Contoh: Mengerjakan fitur login"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="muted small">Tanggal & jam absen dicatat otomatis oleh server saat Anda menekan tombol di bawah.</p>
              <Button type="submit" loading={submitting} className="btn-block">
                Absen Sekarang
              </Button>
            </form>
          </Card>
        )}
      </div>
      <ConfirmDialog
        open={confirmOut}
        title="Clock Out"
        message="Clock out sekarang? Jam pulang dicatat server dan tidak dapat diubah setelahnya."
        confirmLabel="Clock Out"
        loading={checkingOut}
        onConfirm={checkOut}
        onCancel={() => setConfirmOut(false)}
      />
    </>
  );
}
