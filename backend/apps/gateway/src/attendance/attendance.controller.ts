import { ATTENDANCE_SERVICE, JwtPayload, Patterns, Role } from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { CurrentUser, Roles } from '../auth/decorators';
import { sendRpc } from '../common/send-rpc';
import { AttendanceQueryDto, CheckInDto } from './attendance.dto';

const uploadDir = () => resolve(process.env.UPLOAD_DIR || 'uploads');

@ApiTags('Attendances')
@ApiBearerAuth()
@Controller('attendances')
export class AttendanceController {
  constructor(@Inject(ATTENDANCE_SERVICE) private readonly attendance: ClientProxy) {}

  @Post('check-in')
  @Roles(Role.EMPLOYEE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: { photo: { type: 'string', format: 'binary' }, notes: { type: 'string' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir()),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase() || '.jpg'}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        /^image\/(jpeg|png|webp)$/.test(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Foto harus berformat JPG, PNG, atau WEBP'), false),
    }),
  )
  async checkIn(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() photo: Express.Multer.File,
    @Body() dto: CheckInDto,
  ) {
    if (!photo) throw new BadRequestException('Foto bukti WFH wajib diupload');
    try {
      return await sendRpc(this.attendance, Patterns.ATTENDANCE_CHECK_IN, {
        employeeId: user.employeeId,
        photoPath: `/uploads/${photo.filename}`,
        notes: dto.notes,
      });
    } catch (e) {
      // Absen gagal (mis. sudah absen hari ini) -> hapus file yang sudah terlanjur tersimpan
      await unlink(join(uploadDir(), photo.filename)).catch(() => undefined);
      throw e;
    }
  }

  @Get('today')
  @Roles(Role.EMPLOYEE)
  today(@CurrentUser() user: JwtPayload) {
    return sendRpc(this.attendance, Patterns.ATTENDANCE_TODAY, { employeeId: user.employeeId });
  }

  @Get('me')
  @Roles(Role.EMPLOYEE)
  myHistory(@CurrentUser() user: JwtPayload, @Query() query: AttendanceQueryDto) {
    return sendRpc(this.attendance, Patterns.ATTENDANCE_FIND_ALL, { ...query, employeeId: user.employeeId });
  }

  // Monitoring absensi untuk Admin HRD (view only)
  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: AttendanceQueryDto) {
    return sendRpc(this.attendance, Patterns.ATTENDANCE_FIND_ALL, query);
  }
}
