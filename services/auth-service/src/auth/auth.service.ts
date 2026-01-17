import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput) {
    const hashedPassword = await bcrypt.hash(registerInput.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...registerInput,
        password: hashedPassword,
      },
    });

    const accessToken = this.jwtService.sign({ sub: user.id });

    return { user, accessToken };
  }

  async login(loginInput: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginInput.email },
    });

    if (!user || !(await bcrypt.compare(loginInput.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ sub: user.id });

    return { user, accessToken };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return this.validateUser(payload.sub);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}