import { Patterns } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceQuery, AttendanceService, CheckInInput } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern(Patterns.ATTENDANCE_CHECK_IN)
  checkIn(@Payload() data: CheckInInput) {
    return this.attendanceService.checkIn(data);
  }

  @MessagePattern(Patterns.ATTENDANCE_TODAY)
  today(@Payload() data: { employeeId: number }) {
    return this.attendanceService.today(data.employeeId);
  }

  @MessagePattern(Patterns.ATTENDANCE_FIND_ALL)
  findAll(@Payload() query: AttendanceQuery) {
    return this.attendanceService.findAll(query);
  }
}
