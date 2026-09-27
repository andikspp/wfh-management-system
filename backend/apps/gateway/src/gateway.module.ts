import { AppConfigModule, ATTENDANCE_SERVICE, AUTH_SERVICE, EMPLOYEE_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AttendanceController } from './attendance/attendance.controller';
import { AuthController } from './auth/auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { EmployeeController } from './employee/employee.controller';

const tcpClient = (name: string, prefix: string) => ({
  name,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: Transport.TCP as const,
    options: {
      host: config.get(`${prefix}_HOST`, '127.0.0.1'),
      port: Number(config.get(`${prefix}_PORT`)),
    },
  }),
});

@Module({
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ secret: config.getOrThrow('JWT_SECRET') }),
    }),
    ClientsModule.registerAsync([
      tcpClient(AUTH_SERVICE, 'AUTH_SERVICE'),
      tcpClient(EMPLOYEE_SERVICE, 'EMPLOYEE_SERVICE'),
      tcpClient(ATTENDANCE_SERVICE, 'ATTENDANCE_SERVICE'),
    ]),
  ],
  controllers: [AuthController, EmployeeController, AttendanceController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class GatewayModule {}
