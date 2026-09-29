# Dexa WFH Attendance

Aplikasi web untuk **absensi Work From Home (WFH) karyawan** dan **monitoring karyawan oleh Admin HRD**.

- **Karyawan** login lalu melakukan absen. Tanggal & jam dicatat otomatis oleh server, disertai upload foto sebagai bukti sedang bekerja dari rumah.
- **Admin HRD** mengelola master data karyawan (tambah, ubah, nonaktifkan, hapus) dan memantau absensi yang disubmit karyawan (view only).

Dibuat untuk *Dexa Group – Fullstack Developer Skill Test*.

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Backend | Node.js, TypeScript, **NestJS 11** (monorepo, `@nestjs/microservices` via TCP) |
| Database | **MySQL** dengan TypeORM |
| Auth | JWT (`@nestjs/jwt`), password di-hash dengan bcrypt, role `ADMIN` / `EMPLOYEE` |
| Upload | Multer (JPG/PNG/WEBP, maks. 5 MB), disajikan statis dari `/uploads` |
| Dokumentasi API | Swagger / OpenAPI (`@nestjs/swagger`) |
| Frontend | **React 19**, TypeScript, Vite, React Router 7, CSS murni (tanpa UI library) |

## Arsitektur

Backend terdiri dari satu **API Gateway** (HTTP) dan tiga **microservice** (TCP):

| App | Port | Tanggung jawab |
|---|---|---|
| `gateway` | 3000 (HTTP) | REST API untuk frontend, validasi input, JWT guard & role guard, upload foto, Swagger |
| `auth-service` | 4001 (TCP) | Login, profil, ganti password |
| `employee-service` | 4002 (TCP) | CRUD master karyawan beserta akun login-nya |
| `attendance-service` | 4003 (TCP) | Absen harian, status hari ini, riwayat & monitoring absensi |

Entity TypeORM, koneksi database, dan seeder ada di `backend/libs/common` dan dipakai bersama oleh semua service.

### Struktur database

| Tabel | Isi | Relasi |
|---|---|---|
| `users` | Akun login (email, password hash, role) | `employee_id` → `employees.id` (1:1, nullable untuk admin) |
| `employees` | Master karyawan (NIK, nama, email, telepon, jabatan, departemen, tgl. bergabung, status aktif) | NIK & email unik |
| `attendances` | Absensi (tanggal, jam absen, path foto, catatan) | `employee_id` → `employees.id`; unik per karyawan per tanggal |

Menghapus karyawan ikut menghapus akun login dan riwayat absensinya (`ON DELETE CASCADE`).

## Struktur Folder

```
dexa-wfh-attendance/
├── backend/
│   ├── apps/
│   │   ├── gateway/             # HTTP API + Swagger
│   │   ├── auth-service/
│   │   ├── employee-service/
│   │   └── attendance-service/
│   ├── libs/common/             # entity, koneksi DB, seeder, konstanta
│   └── uploads/                 # foto bukti absen (dibuat otomatis)
└── frontend/
    └── src/
        ├── api/                 # HTTP client & fungsi per endpoint
        ├── components/          # custom component
        ├── context/             # auth & toast
        └── pages/               # halaman employee/ dan admin/
```

## Setup & Menjalankan

### Prasyarat

- Node.js 20 atau lebih baru (dikembangkan dengan Node 22)
- MySQL 8 yang sedang berjalan (mis. Laragon/XAMPP)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Sesuaikan koneksi database di `backend/.env` bila perlu:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=dexa_wfh
DB_SYNC=true          # TypeORM membuat tabel otomatis (khusus development)
JWT_SECRET=change-me-please
```

### 2. Seeding database

```bash
npm run seed
```

Tidak perlu membuat database secara manual. Perintah ini:

1. Membuat database `dexa_wfh` bila belum ada, lalu membuat semua tabel.
2. Membuat akun **Admin HRD**.
3. Membuat **5 karyawan demo** (4 aktif, 1 nonaktif) beserta akun login-nya.
4. Mengisi **riwayat absensi 10 hari kerja terakhir** untuk setiap karyawan demo, lengkap dengan foto placeholder dan catatan.
   Absensi **hari ini sengaja dikosongkan** supaya fitur absen bisa langsung dicoba.

Seeder aman dijalankan berulang kali: data yang sudah ada (berdasarkan email) dilewati.

Untuk mengulang dari awal, hapus database lalu jalankan seed lagi:

```sql
DROP DATABASE dexa_wfh;
```

### 3. Menjalankan backend

```bash
npm run start:all
```

Perintah ini menjalankan keempat app sekaligus. Tunggu sampai muncul `Gateway on http://localhost:3000/api`.
Setiap app juga bisa dijalankan terpisah dengan `npm run start:gateway`, `start:auth`, `start:employee`, dan `start:attendance`.

### 4. Frontend (terminal terpisah)

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm run dev
```

Buka **http://localhost:5173**.

## Akun Demo

Tersedia setelah menjalankan `npm run seed`.

| Role | Email | Password | Keterangan |
|---|---|---|---|
| Admin HRD | `admin@dexa.local` | `admin123` | Kelola karyawan & monitoring absensi |
| Karyawan | `budi@dexa.local` | `password123` | Software Engineer, IT |
| Karyawan | `siti@dexa.local` | `password123` | UI/UX Designer, IT |
| Karyawan | `andi@dexa.local` | `password123` | Finance Staff, Finance |
| Karyawan | `dewi@dexa.local` | `password123` | HR Officer, HRD |
| Karyawan | `rudi@dexa.local` | `password123` | **Nonaktif**: login akan ditolak |

Kredensial admin bisa diubah lewat `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` di `backend/.env`.

## Dokumentasi API (Swagger)

Swagger UI tersedia di **http://localhost:3000/docs** setelah backend berjalan.

1. Panggil `POST /api/auth/login` dengan salah satu akun demo, lalu salin nilai `accessToken`.
2. Klik tombol **Authorize** dan tempel token tersebut.
3. Endpoint lain sekarang bisa dicoba langsung dari browser.

Ringkasan endpoint (semua dengan prefix `/api`):

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| POST | `/auth/login` | publik | Login, mengembalikan JWT |
| GET | `/auth/me` | semua | Profil user yang sedang login |
| PUT | `/auth/password` | semua | Ganti password |
| POST | `/employees` | Admin | Tambah karyawan beserta akun login |
| GET | `/employees` | Admin | Daftar karyawan (cari & paginasi) |
| GET | `/employees/:id` | Admin | Detail karyawan |
| PUT | `/employees/:id` | Admin | Ubah data / status / reset password |
| DELETE | `/employees/:id` | Admin | Hapus karyawan |
| POST | `/attendances/check-in` | Karyawan | Absen dengan foto (`multipart/form-data`) |
| GET | `/attendances/today` | Karyawan | Status absen hari ini |
| GET | `/attendances/me` | Karyawan | Riwayat absen sendiri (filter tanggal) |
| GET | `/attendances` | Admin | Monitoring semua absensi (filter tanggal, cari nama/NIK) |

## Pemetaan Requirement

### Mandatory skill

| Requirement | Implementasi |
|---|---|
| Backend: JavaScript/TypeScript | TypeScript di seluruh backend |
| Backend: NestJS | NestJS 11, monorepo `nest-cli` |
| Database: MySQL (prefer) | MySQL + TypeORM |
| Frontend: React.js | React 19 + Vite |

### Objective backend

| Objective | Implementasi |
|---|---|
| Struktur database yang proper | 3 tabel ter-normalisasi dengan foreign key, unique constraint (NIK, email, 1 absen/karyawan/hari), cascade delete. Lihat `backend/libs/common/src/entities` |
| Koneksi ke database | `DatabaseModule` (TypeORM) yang dikonfigurasi lewat `.env` |
| API dengan konsep microservices | API Gateway (HTTP) meneruskan request ke 3 microservice independen lewat transport TCP |
| Manipulasi data (CRUD) lewat API | CRUD karyawan lengkap (`POST/GET/PUT/DELETE /employees`), create & read absensi |

### Objective frontend

| Objective | Implementasi |
|---|---|
| Membuat page/screen | Login, Absen, Riwayat (karyawan), Dashboard, Karyawan, Monitoring Absensi (admin) |
| Memanggil API backend | `frontend/src/api`: fetch client dengan JWT otomatis, penanganan error, dan logout otomatis saat token kedaluwarsa |
| Custom component | `Button`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `Card`, `StatCard`, `Badge`, `DataTable` (generik, jadi tampilan kartu di mobile), `Pagination`, `PhotoUpload` (kamera/file + preview + validasi), `PhotoThumb`, `LiveClock`, `AttendanceFilters`, `ProtectedRoute`, `Layout` |

### Use case 1: Aplikasi Absensi WFH Karyawan

| Kebutuhan | Implementasi |
|---|---|
| Karyawan dapat login | Halaman Login dengan JWT, diarahkan sesuai role |
| Absen dengan capture tanggal & waktu | Jam live di layar. Waktu absen dicatat oleh **server** sehingga tidak bisa dimanipulasi dari sisi klien. Absen dibatasi 1 kali per hari |
| Upload foto bukti WFH | Ambil foto langsung dari kamera atau pilih file, dengan preview sebelum dikirim |
| (Tambahan) | Riwayat absensi pribadi dengan filter tanggal, ganti password |

### Use case 2: Aplikasi Monitoring Karyawan

| Kebutuhan | Implementasi |
|---|---|
| Admin HRD menambah data karyawan | Form Tambah Karyawan, sekaligus membuat akun login karyawan |
| Admin HRD meng-update data karyawan | Form Edit: data diri, status aktif/nonaktif, reset password |
| Kontrol absensi (view only) | Halaman Monitoring Absensi: tanpa aksi ubah/hapus, dengan filter tanggal, pencarian nama/NIK, dan foto bukti yang bisa diperbesar |
| (Tambahan) | Dashboard ringkasan hari ini, hapus karyawan dengan konfirmasi, karyawan nonaktif tidak bisa login/absen |
