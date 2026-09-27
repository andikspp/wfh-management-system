import { Patterns } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(Patterns.AUTH_LOGIN)
  login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern(Patterns.AUTH_ME)
  me(@Payload() data: { userId: number }) {
    return this.authService.me(data.userId);
  }

  @MessagePattern(Patterns.AUTH_CHANGE_PASSWORD)
  changePassword(@Payload() data: { userId: number; oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(data.userId, data.oldPassword, data.newPassword);
  }
}
