const pad = (n: number) => String(n).padStart(2, '0');

export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatShortDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Terjadi kesalahan');
