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
  ATTENDANCE_TODAY: 'attendance.today',
  ATTENDANCE_FIND_ALL: 'attendance.find_all',
} as const;
