import { useEffect, useState, type FormEvent } from 'react';
import { attendanceApi } from '../../api';
import type { Attendance, WorkSchedule } from '../../api/types';
import { AttendanceStatus, formatMinutes } from '../../components/AttendanceStatus';
import { DayProgress } from '../../components/DayProgress';
import { PhotoThumb, PhotoUpload } from '../../components/PhotoUpload';
import { WeekSummary } from '../../components/WeekSummary';
import { Badge, Button, Card, ConfirmDialog, PageLoader } from '../../components/ui';
import { Icon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate, formatTime, minutesBetween, timeToMinutes } from '../../utils';

function greeting(hour: number) {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Waktu sekarang, diperbarui tiap `ms` */
function useNow(ms: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function CheckInPage() {
  const { user } = useAuth();
  const notify = useToast();
  const now = useNow(1000);
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
    document.title = 'Absen · Dexa WFH';
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
      notify('success', 'Absen masuk berhasil dicatat. Selamat bekerja!');
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
      notify('success', 'Clock out berhasil dicatat. Terima kasih untuk hari ini!');
    } catch (err) {
      notify('error', errorMessage(err));
    } finally {
      setCheckingOut(false);
      setConfirmOut(false);
    }
  };

  if (loading) return <PageLoader />;

  // Perkiraan status bila aksi dilakukan sekarang (penentu akhirnya tetap server)
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const lateIfNow = schedule ? nowMin - timeToMinutes(schedule.checkInTime) : 0;
  const willBeLate = !!schedule && lateIfNow > schedule.lateToleranceMinutes;
  const earlyIfNow = schedule ? timeToMinutes(schedule.checkOutTime) - nowMin : 0;
  const firstName = user?.name?.split(' ')[0];
  const refreshKey = `${today?.id ?? 'none'}-${today?.checkOutAt ?? ''}`;

  return (
    <>
      <section className="hero">
        <div className="hero-main">
          <div>
            <p className="hero-greeting">
              {greeting(now.getHours())}, <strong>{firstName}</strong>
            </p>
            <p className="hero-sub">{[user?.employee?.position, user?.employee?.department].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="hero-clock">
            <span className="hero-time">{formatTime(now)}</span>
            <span className="hero-date">{formatDate(now)}</span>
          </div>
        </div>
        {schedule && (
          <div className="hero-meta">
            <span className="hero-pill">
              <Icon name="clock" size={15} />
              Jam kerja {schedule.checkInTime}–{schedule.checkOutTime}
              {schedule.lateToleranceMinutes > 0 && ` · toleransi ${schedule.lateToleranceMinutes} mnt`}
            </span>
          </div>
        )}
        <div className="hero-progress">
          <DayProgress today={today} />
        </div>
      </section>

      <div className="employee-grid">
        {!today ? (
          <Card title="Absen Masuk">
            {willBeLate && schedule && (
              <div className="alert alert-warning">
                <Icon name="alert-triangle" size={16} />
                <span>
                  {schedule.lateToleranceMinutes > 0
                    ? `Sudah lewat batas toleransi (${schedule.checkInTime} + ${schedule.lateToleranceMinutes} mnt).`
                    : `Sudah lewat jam masuk (${schedule.checkInTime}).`} Absen sekarang akan tercatat{' '}
                  <strong>terlambat {formatMinutes(lateIfNow)}</strong>.
                </span>
              </div>
            )}
            <form onSubmit={submit} className="form">
              <div className="step-label">
                <span className="step-num">1</span> Foto bukti bekerja dari rumah
              </div>
              <PhotoUpload
                value={photo}
                onChange={(f) => {
                  setPhoto(f);
                  setPhotoError('');
                }}
                error={photoError}
              />
              <div className="step-label">
                <span className="step-num">2</span> Rencana pekerjaan hari ini <span className="muted">(opsional)</span>
              </div>
              <div className="notes-field">
                <textarea
                  name="notes"
                  aria-label="Catatan pekerjaan"
                  rows={3}
                  maxLength={255}
                  placeholder="Contoh: Mengerjakan fitur login"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <small className="muted">{notes.length}/255</small>
              </div>
              <Button type="submit" icon="check-circle" loading={submitting} className="btn-block btn-lg" disabled={!photo}>
                {photo ? 'Absen Masuk Sekarang' : 'Tambahkan foto untuk absen'}
              </Button>
              <p className="muted small center">Tanggal & jam dicatat otomatis oleh server saat tombol ditekan.</p>
            </form>
          </Card>
        ) : (
          <Card
            title={today.checkOutAt ? 'Selesai Hari Ini' : 'Sedang Bekerja'}
            actions={today.checkOutAt ? <Badge tone="success">Sudah clock out</Badge> : <Badge tone="info">Aktif</Badge>}
          >
            <div className="today-summary">
              <div className="today-duration">
                <small className="muted">{today.checkOutAt ? 'Total durasi kerja' : 'Sudah bekerja selama'}</small>
                <strong>{formatMinutes(minutesBetween(today.checkInAt, today.checkOutAt ?? now))}</strong>
              </div>
              <div className="today-times">
                <div>
                  <small className="muted">Masuk</small>
                  <strong>{formatTime(today.checkInAt)}</strong>
                </div>
                <Icon name="chevron-right" size={18} className="muted" />
                <div>
                  <small className="muted">Pulang</small>
                  <strong>{today.checkOutAt ? formatTime(today.checkOutAt) : '--:--'}</strong>
                </div>
              </div>
              <AttendanceStatus a={today} />
            </div>

            <div className="today-proof">
              <PhotoThumb path={today.photoPath} title={`Bukti WFH ${formatDate(today.checkInAt)}`} />
              <div>
                <small className="muted">Catatan</small>
                <p>{today.notes || <span className="muted">Tidak ada catatan</span>}</p>
              </div>
            </div>

            {today.checkOutAt ? (
              <p className="done-note">
                <Icon name="check-circle" size={16} /> Absensi hari ini lengkap. Terima kasih dan selamat beristirahat!
              </p>
            ) : (
              <Button icon="logout" onClick={() => setConfirmOut(true)} className="btn-block btn-lg">
                Clock Out
              </Button>
            )}
          </Card>
        )}

        <WeekSummary refreshKey={refreshKey} />
      </div>

      <ConfirmDialog
        open={confirmOut}
        title="Clock Out"
        message={
          earlyIfNow > 0 ? (
            <>
              Jam pulang {schedule?.checkOutTime}, masih <strong>{formatMinutes(earlyIfNow)}</strong> lagi. Clock out sekarang akan tercatat{' '}
              <strong>pulang cepat</strong>. Lanjutkan?
            </>
          ) : (
            'Selesai bekerja untuk hari ini? Jam pulang dicatat server dan tidak dapat diubah setelahnya.'
          )
        }
        confirmLabel="Ya, Clock Out"
        tone="primary"
        icon="logout"
        loading={checkingOut}
        onConfirm={checkOut}
        onCancel={() => setConfirmOut(false)}
      />
    </>
  );
}
