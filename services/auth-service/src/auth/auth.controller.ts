import { Controller, Get, UseGuards } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('validate_token')
  async validateToken(@Payload() data: { token: string }) {
    const user = await this.authService.validateToken(data.token);
    return user;
  }
}