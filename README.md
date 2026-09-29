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
| `attendance-service` | 4003 (TCP) | Absen harian & clock out, jam kerja, status terlambat/pulang cepat, riwayat & monitoring absensi |

Entity TypeORM, koneksi database, dan seeder ada di `backend/libs/common` dan dipakai bersama oleh semua service.

### Struktur database

| Tabel | Isi | Relasi |
|---|---|---|
| `users` | Akun login (email, password hash, role) | `employee_id` → `employees.id` (1:1, nullable untuk admin) |
| `employees` | Master karyawan (NIK, nama, email, telepon, jabatan, departemen, tgl. bergabung, status aktif) | NIK & email unik |
| `attendances` | Absensi (tanggal, jam absen, jam pulang, menit terlambat, menit pulang cepat, path foto, catatan) | `employee_id` → `employees.id`; unik per karyawan per tanggal |
| `work_schedules` | Jam kerja (jam masuk, jam pulang, toleransi terlambat), satu baris untuk semua karyawan | - |

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
| POST | `/attendances/check-out` | Karyawan | Clock out (jam pulang dicatat server) |
| GET | `/attendances/today` | Karyawan | Status absen hari ini |
| GET | `/attendances/schedule` | Semua | Jam kerja yang berlaku |
| PUT | `/attendances/schedule` | Admin | Ubah jam masuk, jam pulang, dan toleransi terlambat |
| GET | `/attendances/me` | Karyawan | Riwayat absen sendiri (filter tanggal) |
| GET | `/attendances` | Admin | Monitoring semua absensi (filter tanggal, status, cari nama/NIK) |
