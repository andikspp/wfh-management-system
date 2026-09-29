import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../employee/employee.dto';

export class CheckInDto {
  @ApiPropertyOptional({ example: 'Mengerjakan fitur login' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}

export class AttendanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @ApiPropertyOptional({ enum: ['LATE', 'EARLY_LEAVE', 'ON_TIME'] })
  @IsOptional()
  @IsIn(['LATE', 'EARLY_LEAVE', 'ON_TIME'])
  status?: 'LATE' | 'EARLY_LEAVE' | 'ON_TIME';
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class WorkScheduleDto {
  @ApiProperty({ example: '08:00' })
  @Matches(TIME_REGEX, { message: 'Jam masuk harus berformat HH:mm' })
  checkInTime: string;

  @ApiProperty({ example: '17:00' })
  @Matches(TIME_REGEX, { message: 'Jam pulang harus berformat HH:mm' })
  checkOutTime: string;

  @ApiProperty({ example: 15, description: 'Toleransi keterlambatan (menit)' })
  @IsInt()
  @Min(0)
  @Max(240)
  lateToleranceMinutes: number;
}
