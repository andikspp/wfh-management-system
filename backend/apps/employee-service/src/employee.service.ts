import { Employee, Paginated, Role, rpcError, User } from '@app/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';

export interface CreateEmployeeInput {
  nik: string;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  joinDate: string;
  password: string;
}

export type UpdateEmployeeInput = Partial<Omit<CreateEmployeeInput, 'password'>> & {
  isActive?: boolean;
  password?: string;
};

export interface EmployeeQuery {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  async create(input: CreateEmployeeInput): Promise<Employee> {
    await this.ensureUnique(input.nik, input.email);
    const { password, ...data } = input;

    // Data karyawan dan akun login dibuat dalam satu transaksi
    return this.dataSource.transaction(async (m) => {
      const employee = await m.save(m.create(Employee, data));
      await m.save(
        m.create(User, {
          email: employee.email,
          passwordHash: await bcrypt.hash(password, 10),
          role: Role.EMPLOYEE,
          employeeId: employee.id,
        }),
      );
      return employee;
    });
  }

  async findAll({ search, page = 1, limit = 10 }: EmployeeQuery): Promise<Paginated<Employee>> {
    const qb = this.employees.createQueryBuilder('e').orderBy('e.fullName', 'ASC');
    if (search) {
      qb.where('(e.fullName LIKE :s OR e.nik LIKE :s OR e.email LIKE :s OR e.department LIKE :s)', {
        s: `%${search}%`,
      });
    }
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employees.findOne({ where: { id } });
    if (!employee) throw rpcError(HttpStatus.NOT_FOUND, 'Karyawan tidak ditemukan');
    return employee;
  }

  async update(id: number, input: UpdateEmployeeInput): Promise<Employee> {
    const employee = await this.findOne(id);
    await this.ensureUnique(input.nik, input.email, id);
    const { password, ...data } = input;

    return this.dataSource.transaction(async (m) => {
      const saved = await m.save(Employee, { ...employee, ...data });
      // Email & password login ikut disinkronkan ke tabel users
      const userPatch: Partial<User> = {};
      if (data.email) userPatch.email = data.email;
      if (password) userPatch.passwordHash = await bcrypt.hash(password, 10);
      if (Object.keys(userPatch).length) await m.update(User, { employeeId: id }, userPatch);
      return saved;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.employees.delete(id); // users & attendances ikut terhapus (ON DELETE CASCADE)
    return { success: true };
  }

  private async ensureUnique(nik?: string, email?: string, excludeId?: number) {
    if (nik) {
      const found = await this.employees.findOne({ where: { nik } });
      if (found && found.id !== excludeId) throw rpcError(HttpStatus.CONFLICT, 'NIK sudah terdaftar');
    }
    if (email) {
      const found = await this.dataSource.getRepository(User).findOne({ where: { email } });
      if (found && found.employeeId !== excludeId) throw rpcError(HttpStatus.CONFLICT, 'Email sudah terdaftar');
    }
  }
}
