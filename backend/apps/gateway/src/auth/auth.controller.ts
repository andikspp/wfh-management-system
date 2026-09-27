import { AUTH_SERVICE, JwtPayload, Patterns } from '@app/common';
import { Body, Controller, Get, HttpCode, Inject, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { sendRpc } from '../common/send-rpc';
import { CurrentUser, Public } from './decorators';
import { ChangePasswordDto, LoginDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly auth: ClientProxy) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return sendRpc(this.auth, Patterns.AUTH_LOGIN, dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return sendRpc(this.auth, Patterns.AUTH_ME, { userId: user.sub });
  }

  @ApiBearerAuth()
  @Put('password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return sendRpc(this.auth, Patterns.AUTH_CHANGE_PASSWORD, { userId: user.sub, ...dto });
  }
}
