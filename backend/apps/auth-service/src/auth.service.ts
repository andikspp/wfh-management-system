import { JwtPayload, rpcError, User } from '@app/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .leftJoinAndSelect('u.employee', 'e')
      .where('u.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw rpcError(HttpStatus.UNAUTHORIZED, 'Email atau password salah');
    }
    if (user.employee && !user.employee.isActive) {
      throw rpcError(HttpStatus.FORBIDDEN, 'Akun karyawan tidak aktif');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      name: user.employee?.fullName ?? 'Admin HRD',
    };
    return { accessToken: await this.jwt.signAsync(payload), user: this.toProfile(user) };
  }

  async me(userId: number) {
    const user = await this.users.findOne({ where: { id: userId }, relations: { employee: true } });
    if (!user) throw rpcError(HttpStatus.NOT_FOUND, 'User tidak ditemukan');
    return this.toProfile(user);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :userId', { userId })
      .getOne();
    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
      throw rpcError(HttpStatus.BAD_REQUEST, 'Password lama salah');
    }
    await this.users.update(userId, { passwordHash: await bcrypt.hash(newPassword, 10) });
    return { success: true };
  }

  private toProfile(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      name: user.employee?.fullName ?? 'Admin HRD',
      employee: user.employee ?? null,
    };
  }
}
