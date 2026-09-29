import { AppConfigModule, Attendance, DatabaseModule, Employee, WorkSchedule } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [AppConfigModule, DatabaseModule.forRoot(), TypeOrmModule.forFeature([Attendance, Employee, WorkSchedule])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
