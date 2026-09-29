import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { DEFAULT_WORK_SCHEDULE, Role } from '../constants';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Attendance, Employee, ENTITIES, User, WorkSchedule } from '../entities';

dotenv.config();

async function main() {
  const dbName = process.env.DB_NAME || 'dexa_wfh';
  const base = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  const conn = await createConnection(base);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();

  const ds = new DataSource({
    type: 'mysql',
    ...base,
    username: base.user,
    database: dbName,
    entities: ENTITIES,
    synchronize: true,
    timezone: 'local',
  });
  await ds.initialize();

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@dexa.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const repo = ds.getRepository(User);
  if (await repo.findOne({ where: { email } })) {
    console.log(`Admin ${email} sudah ada, skip.`);
  } else {
    await repo.save(repo.create({ email, passwordHash: await bcrypt.hash(password, 10), role: Role.ADMIN }));
    console.log(`Admin dibuat: ${email} / ${password}`);
  }

  const schedules = ds.getRepository(WorkSchedule);
  if (!(await schedules.exist({ where: { id: 1 } }))) {
    await schedules.save(schedules.create({ id: 1, ...DEFAULT_WORK_SCHEDULE }));
    console.log(`Jam kerja default: ${DEFAULT_WORK_SCHEDULE.checkInTime} - ${DEFAULT_WORK_SCHEDULE.checkOutTime}`);
  }

  await seedDemo(ds);
  await ds.destroy();
}

const DEMO_PASSWORD = 'password123';
const DEMO_EMPLOYEES = [
  { nik: 'EMP001', fullName: 'Budi Santoso', email: 'budi@dexa.local', phone: '081234567801', position: 'Software Engineer', department: 'IT', joinDate: '2023-02-01' },
  { nik: 'EMP002', fullName: 'Siti Rahmawati', email: 'siti@dexa.local', phone: '081234567802', position: 'UI/UX Designer', department: 'IT', joinDate: '2023-06-12' },
  { nik: 'EMP003', fullName: 'Andi Pratama', email: 'andi@dexa.local', phone: '081234567803', position: 'Finance Staff', department: 'Finance', joinDate: '2022-09-05' },
  { nik: 'EMP004', fullName: 'Dewi Lestari', email: 'dewi@dexa.local', phone: '081234567804', position: 'HR Officer', department: 'HRD', joinDate: '2024-01-15' },
  { nik: 'EMP005', fullName: 'Rudi Hartono', email: 'rudi@dexa.local', phone: null, position: 'Marketing Specialist', department: 'Marketing', joinDate: '2021-11-20', isActive: false },
];
const DEMO_NOTES = ['Mengerjakan fitur baru', 'Meeting online dengan tim', 'Menyusun laporan mingguan', 'Review pekerjaan tim', null];

/** Karyawan demo + riwayat absensi 10 hari kerja terakhir (hari ini dikosongkan agar bisa dicoba absen) */
async function seedDemo(ds: DataSource) {
  const uploadDir = resolve(process.env.UPLOAD_DIR || 'uploads');
  mkdirSync(uploadDir, { recursive: true });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const [i, data] of DEMO_EMPLOYEES.entries()) {
    if (await ds.getRepository(User).findOne({ where: { email: data.email } })) {
      console.log(`Karyawan demo ${data.email} sudah ada, skip.`);
      continue;
    }
    await ds.transaction(async (m) => {
      const employee = await m.save(m.create(Employee, { isActive: true, ...data }));
      await m.save(m.create(User, { email: data.email, passwordHash, role: Role.EMPLOYEE, employeeId: employee.id }));

      const photoPath = `/uploads/demo-${data.nik.toLowerCase()}.svg`;
      writeFileSync(join(uploadDir, `demo-${data.nik.toLowerCase()}.svg`), placeholderPhoto(data.fullName, i));

      const attendances: Partial<Attendance>[] = [];
      for (const day of lastWorkdays(10)) {
        if ((day.getDate() + i) % 5 === 0) continue; // sesekali tidak absen, agar data lebih realistis
        const checkInAt = new Date(day);
        checkInAt.setHours(7 + (i % 2), 30 + ((day.getDate() * 7 + i * 11) % 30), (i * 13) % 60);
        const checkOutAt = new Date(checkInAt);
        checkOutAt.setHours(checkInAt.getHours() + 9, (day.getDate() * 3 + i * 17) % 60);
        const late = minutesOfDay(checkInAt) - toMinutes(DEFAULT_WORK_SCHEDULE.checkInTime);
        attendances.push({
          employeeId: employee.id,
          attendanceDate: localDate(day),
          checkInAt,
          checkOutAt,
          lateMinutes: late > DEFAULT_WORK_SCHEDULE.lateToleranceMinutes ? late : 0,
          earlyLeaveMinutes: Math.max(toMinutes(DEFAULT_WORK_SCHEDULE.checkOutTime) - minutesOfDay(checkOutAt), 0),
          photoPath,
          notes: DEMO_NOTES[(day.getDate() + i) % DEMO_NOTES.length],
        });
      }
      await m.save(Attendance, attendances.map((a) => m.create(Attendance, a)));
    });
    console.log(`Karyawan demo dibuat: ${data.email} / ${DEMO_PASSWORD}`);
  }
}

function lastWorkdays(count: number): Date[] {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
  }
  return days;
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function placeholderPhoto(name: string, i: number): string {
  const colors = ['#1d5bd8', '#1b8a4b', '#b3541e', '#7a3db8', '#c93434'];
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="${colors[i % colors.length]}"/>
  <circle cx="320" cy="200" r="90" fill="#ffffff" fill-opacity="0.2"/>
  <text x="320" y="228" font-family="sans-serif" font-size="80" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text>
  <text x="320" y="360" font-family="sans-serif" font-size="28" fill="#fff" text-anchor="middle">Foto demo WFH - ${name}</text>
</svg>`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
