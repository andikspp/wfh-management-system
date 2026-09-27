import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../constants';
import { Employee } from './employee.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;

  // Admin HRD boleh tidak terhubung ke data karyawan
  @Column({ name: 'employee_id', type: 'int', nullable: true, unique: true })
  employeeId: number | null;

  @OneToOne(() => Employee, (e) => e.user, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
