# Dexa WFH Attendance — Frontend

React 19 + TypeScript + Vite + React Router.

## Menjalankan

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
```

Backend (gateway + microservices) harus sudah berjalan: `cd ../backend && npm run start:all`.

## Halaman

| Role | Route | Fungsi |
|---|---|---|
| Semua | `/login` | Login, diarahkan sesuai role |
| Karyawan | `/employee` | Jam live, absen WFH dengan foto (kamera / file) + catatan |
| Karyawan | `/employee/history` | Riwayat absensi sendiri, filter tanggal |
| Admin HRD | `/admin` | Ringkasan: total karyawan, sudah/belum absen hari ini |
| Admin HRD | `/admin/employees` | CRUD master karyawan, cari, paginasi |
| Admin HRD | `/admin/attendances` | Monitoring absensi (view only), filter tanggal & cari |

## Struktur

- `src/api/` — `request()` berbasis fetch (token JWT otomatis, error handling), tipe data, dan fungsi per endpoint
- `src/context/` — `AuthContext` (sesi login) dan `ToastContext` (notifikasi)
- `src/components/` — komponen custom: `Button`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `Card`, `Badge`,
  `DataTable`, `Pagination`, `PhotoUpload`, `PhotoThumb`, `LiveClock`, `AttendanceFilters`, `Layout`, `ProtectedRoute`
- `src/pages/` — halaman `employee/` dan `admin/`
