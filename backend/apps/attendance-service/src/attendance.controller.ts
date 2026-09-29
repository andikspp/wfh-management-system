import { Patterns } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceQuery, AttendanceService, CheckInInput, WorkScheduleInput } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern(Patterns.ATTENDANCE_CHECK_IN)
  checkIn(@Payload() data: CheckInInput) {
    return this.attendanceService.checkIn(data);
  }

  @MessagePattern(Patterns.ATTENDANCE_CHECK_OUT)
  checkOut(@Payload() data: { employeeId: number }) {
    return this.attendanceService.checkOut(data.employeeId);
  }

  @MessagePattern(Patterns.ATTENDANCE_TODAY)
  today(@Payload() data: { employeeId: number }) {
    return this.attendanceService.today(data.employeeId);
  }

  @MessagePattern(Patterns.SCHEDULE_GET)
  getSchedule() {
    return this.attendanceService.getSchedule();
  }

  @MessagePattern(Patterns.SCHEDULE_UPDATE)
  updateSchedule(@Payload() data: WorkScheduleInput) {
    return this.attendanceService.updateSchedule(data);
  }

  @MessagePattern(Patterns.ATTENDANCE_FIND_ALL)
  findAll(@Payload() query: AttendanceQuery) {
    return this.attendanceService.findAll(query);
  }
}
