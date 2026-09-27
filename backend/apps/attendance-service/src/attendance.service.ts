import { Attendance, Employee, Paginated, rpcError } from '@app/common';
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
  page?: number;
  limit?: number;
}

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
  ) {}

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

    return this.attendances.save(
      this.attendances.create({ employeeId, attendanceDate, checkInAt: now, photoPath, notes: notes || null }),
    );
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
