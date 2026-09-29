import { Attendance } from './attendance.entity';
import { Employee } from './employee.entity';
import { User } from './user.entity';
import { WorkSchedule } from './work-schedule.entity';

export { Attendance, Employee, User, WorkSchedule };
export const ENTITIES = [User, Employee, Attendance, WorkSchedule];
