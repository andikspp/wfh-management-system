import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Jam kerja yang berlaku untuk semua karyawan (satu baris, id = 1) */
@Entity('work_schedules')
export class WorkSchedule {
  @PrimaryColumn()
  id: number;

  // Format HH:mm:ss (tipe TIME MySQL)
  @Column({ name: 'check_in_time', type: 'time' })
  checkInTime: string;

  @Column({ name: 'check_out_time', type: 'time' })
  checkOutTime: string;

  // Toleransi keterlambatan sebelum absen dianggap terlambat
  @Column({ name: 'late_tolerance_minutes', default: 0 })
  lateToleranceMinutes: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
