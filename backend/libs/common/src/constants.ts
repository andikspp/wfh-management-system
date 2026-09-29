export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export const AUTH_SERVICE = 'AUTH_SERVICE';
export const EMPLOYEE_SERVICE = 'EMPLOYEE_SERVICE';
export const ATTENDANCE_SERVICE = 'ATTENDANCE_SERVICE';

// Message pattern antar service (TCP)
export const Patterns = {
  AUTH_LOGIN: 'auth.login',
  AUTH_ME: 'auth.me',
  AUTH_CHANGE_PASSWORD: 'auth.change_password',

  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_FIND_ALL: 'employee.find_all',
  EMPLOYEE_FIND_ONE: 'employee.find_one',
  EMPLOYEE_UPDATE: 'employee.update',
  EMPLOYEE_DELETE: 'employee.delete',

  ATTENDANCE_CHECK_IN: 'attendance.check_in',
  ATTENDANCE_CHECK_OUT: 'attendance.check_out',
  ATTENDANCE_TODAY: 'attendance.today',
  ATTENDANCE_FIND_ALL: 'attendance.find_all',

  SCHEDULE_GET: 'schedule.get',
  SCHEDULE_UPDATE: 'schedule.update',
} as const;

export const DEFAULT_WORK_SCHEDULE = {
  checkInTime: '08:00',
  checkOutTime: '17:00',
  lateToleranceMinutes: 15,
};

export type AttendanceStatusFilter = 'LATE' | 'EARLY_LEAVE' | 'ON_TIME';
