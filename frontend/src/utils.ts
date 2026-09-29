const pad = (n: number) => String(n).padStart(2, '0');

export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatShortDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Terjadi kesalahan');

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/** Senin pada minggu yang sama */
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

/** 'HH:mm' -> menit sejak 00:00 */
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Selisih menit antara dua waktu (b - a), minimal 0 */
export const minutesBetween = (a: string | Date, b: string | Date) =>
  Math.max(Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 60_000), 0);
