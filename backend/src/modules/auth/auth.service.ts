import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordIsValid = await bcrypt.compare(loginDto.password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmailForAuth(forgotPasswordDto.email);

    if (!user || !user.isActive) {
      throw new NotFoundException('E-mail não encontrado');
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresInMinutes = this.getTokenTtlMinutes();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001'
    ).replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/recuperar-senha?token=${encodeURIComponent(token)}`;

    try {
      await this.mailService.sendPasswordResetEmail({
        to: user.email,
        recipientName: user.fullName,
        resetUrl,
        expiresInMinutes,
      });
    } catch (error) {
      await this.prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      throw error;
    }

    return { message: 'E-mail de recuperação enviado.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = this.hashToken(resetPasswordDto.token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
        user: { select: { isActive: true } },
      },
    });
    const now = new Date();

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= now ||
      !resetToken.user.isActive
    ) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.password, 10);

    await this.prisma.$transaction(async (transaction) => {
      const claimedToken = await transaction.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (claimedToken.count !== 1) {
        throw new BadRequestException('Token inválido ou expirado');
      }

      await transaction.user.update({
        where: { id: resetToken.userId },
        data: { password: passwordHash },
      });

      await transaction.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
          usedAt: null,
        },
        data: { usedAt: now },
      });
    });

    return { message: 'Senha alterada com sucesso.' };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getTokenTtlMinutes() {
    const configuredValue = Number(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_TTL_MINUTES') ?? 30,
    );

    return Number.isInteger(configuredValue) && configuredValue > 0 ? configuredValue : 30;
  }
}
