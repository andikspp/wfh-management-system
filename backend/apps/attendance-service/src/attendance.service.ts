import {
  Attendance,
  AttendanceStatusFilter,
  DEFAULT_WORK_SCHEDULE,
  Employee,
  Paginated,
  rpcError,
  WorkSchedule,
} from '@app/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface CheckInInput {
  employeeId: number;
  photoPath: string;
  notes?: string;
}

export interface AttendanceQuery {
  employeeId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  search?: string;
  status?: AttendanceStatusFilter;
  page?: number;
  limit?: number;
}

export interface WorkScheduleInput {
  checkInTime: string; // HH:mm
  checkOutTime: string;
  lateToleranceMinutes: number;
}

export type WorkScheduleView = WorkScheduleInput & { updatedAt: Date | null };

/** 'HH:mm' atau 'HH:mm:ss' -> menit sejak 00:00 */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Tanggal lokal server dalam format YYYY-MM-DD */
function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private readonly attendances: Repository<Attendance>,
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    @InjectRepository(WorkSchedule) private readonly schedules: Repository<WorkSchedule>,
  ) {}

  async getSchedule(): Promise<WorkScheduleView> {
    const s = await this.schedules.findOne({ where: { id: 1 } });
    if (!s) return { ...DEFAULT_WORK_SCHEDULE, updatedAt: null };
    return {
      checkInTime: s.checkInTime.slice(0, 5),
      checkOutTime: s.checkOutTime.slice(0, 5),
      lateToleranceMinutes: s.lateToleranceMinutes,
      updatedAt: s.updatedAt,
    };
  }

  async updateSchedule(input: WorkScheduleInput): Promise<WorkScheduleView> {
    if (toMinutes(input.checkOutTime) <= toMinutes(input.checkInTime)) {
      throw rpcError(HttpStatus.BAD_REQUEST, 'Jam pulang harus setelah jam masuk');
    }
    await this.schedules.save(this.schedules.create({ id: 1, ...input }));
    return this.getSchedule();
  }

  async checkIn({ employeeId, photoPath, notes }: CheckInInput): Promise<Attendance> {
    const employee = await this.employees.findOne({ where: { id: employeeId } });
    if (!employee || !employee.isActive) {
      throw rpcError(HttpStatus.FORBIDDEN, 'Karyawan tidak ditemukan atau tidak aktif');
    }

    const now = new Date();
    const attendanceDate = localDate(now);
    if (await this.attendances.exist({ where: { employeeId, attendanceDate } })) {
      throw rpcError(HttpStatus.CONFLICT, 'Anda sudah melakukan absen hari ini');
    }

    const schedule = await this.getSchedule();
    const late = minutesOfDay(now) - toMinutes(schedule.checkInTime);
    const lateMinutes = late > schedule.lateToleranceMinutes ? late : 0;

    return this.attendances.save(
      this.attendances.create({ employeeId, attendanceDate, checkInAt: now, photoPath, notes: notes || null, lateMinutes }),
    );
  }

  async checkOut(employeeId: number): Promise<Attendance> {
    const attendance = await this.attendances.findOne({ where: { employeeId, attendanceDate: localDate(new Date()) } });
    if (!attendance) {
      throw rpcError(HttpStatus.BAD_REQUEST, 'Anda belum melakukan absen masuk hari ini');
    }
    if (attendance.checkOutAt) {
      throw rpcError(HttpStatus.CONFLICT, 'Anda sudah melakukan clock out hari ini');
    }

    const now = new Date();
    const schedule = await this.getSchedule();
    attendance.checkOutAt = now;
    attendance.earlyLeaveMinutes = Math.max(toMinutes(schedule.checkOutTime) - minutesOfDay(now), 0);
    return this.attendances.save(attendance);
  }

  async today(employeeId: number): Promise<{ checkedIn: boolean; attendance: Attendance | null }> {
    const attendance = await this.attendances.findOne({ where: { employeeId, attendanceDate: localDate(new Date()) } });
    return { checkedIn: !!attendance, attendance };
  }

  async findAll(q: AttendanceQuery): Promise<Paginated<Attendance>> {
    const page = Number(q.page) || 1;
    const limit = Number(q.limit) || 10;
    const qb = this.attendances
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.employee', 'e')
      .orderBy('a.checkInAt', 'DESC');

    if (q.employeeId) qb.andWhere('a.employeeId = :employeeId', { employeeId: q.employeeId });
    if (q.startDate) qb.andWhere('a.attendanceDate >= :startDate', { startDate: q.startDate });
    if (q.endDate) qb.andWhere('a.attendanceDate <= :endDate', { endDate: q.endDate });
    if (q.status === 'LATE') qb.andWhere('a.lateMinutes > 0');
    if (q.status === 'EARLY_LEAVE') qb.andWhere('a.earlyLeaveMinutes > 0');
    if (q.status === 'ON_TIME') qb.andWhere('a.lateMinutes = 0 AND a.earlyLeaveMinutes = 0');
    if (q.search) {
      qb.andWhere('(e.fullName LIKE :s OR e.nik LIKE :s)', { s: `%${q.search}%` });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }
}
