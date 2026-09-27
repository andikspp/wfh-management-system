import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('attendances')
@Index('uq_attendance_employee_date', ['employeeId', 'attendanceDate'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee, (e) => e.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Tanggal absen (untuk batasan 1x absen per hari)
  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: string;

  // Waktu absen dicatat server, bukan dari client
  @Column({ name: 'check_in_at', type: 'datetime' })
  checkInAt: Date;

  @Column({ name: 'photo_path', length: 255 })
  photoPath: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
