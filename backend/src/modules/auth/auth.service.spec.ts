import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('Servico de autenticacao', () => {
  let service: AuthService;
  const usersServiceMock = {
    findByEmailForAuth: jest.fn(),
  };
  const jwtServiceMock = {
    signAsync: jest.fn(),
  };
  const passwordResetTokenMock = {
    create: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  };
  const transactionClientMock = {
    passwordResetToken: {
      updateMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };
  const prismaServiceMock = {
    passwordResetToken: passwordResetTokenMock,
    $transaction: jest.fn(async (operation: unknown) => {
      if (typeof operation === 'function') {
        return operation(transactionClientMock);
      }
      return Promise.all(operation as Promise<unknown>[]);
    }),
  };
  const configServiceMock = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        FRONTEND_URL: 'http://localhost:3001',
        PASSWORD_RESET_TOKEN_TTL_MINUTES: '30',
      };
      return config[key];
    }),
  };
  const mailServiceMock = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar Unauthorized quando o email nao existir', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue(null);

    await expect(
      service.login({ email: 'usuario@teste.com', password: 'Senha@123' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password.'));

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });

  it('deve retornar Unauthorized quando a senha estiver incorreta', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue({
      id: 'user-1',
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      phone: null,
      password: 'senha-hash',
      role: 'ADOPTER',
      organizationId: null,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'usuario@teste.com', password: 'Senha@123' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password.'));

    expect(bcrypt.compare).toHaveBeenCalledWith('Senha@123', 'senha-hash');
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });

  it('deve gerar token com sub e role quando o login for valido', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue({
      id: 'user-1',
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      phone: null,
      password: 'senha-hash',
      role: 'ADOPTER',
      organizationId: null,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      email: 'usuario@teste.com',
      password: 'Senha@123',
    });

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'ADOPTER',
      organizationId: null,
    });
    expect(result).toEqual({
      access_token: 'jwt-token',
      user: expect.objectContaining({
        id: 'user-1',
        fullName: 'Usuario Teste',
        email: 'usuario@teste.com',
        role: 'ADOPTER',
        organizationId: null,
      }),
    });
  });

  it('deve rejeitar recuperacao para email nao cadastrado', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue(null);

    await expect(service.forgotPassword({ email: 'inexistente@teste.com' })).rejects.toThrow(
      new NotFoundException('E-mail não encontrado'),
    );

    expect(passwordResetTokenMock.create).not.toHaveBeenCalled();
    expect(mailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('deve criar token com hash e enviar link de recuperacao', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue({
      id: 'user-1',
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      isActive: true,
    });
    passwordResetTokenMock.deleteMany.mockResolvedValue({ count: 0 });
    passwordResetTokenMock.create.mockResolvedValue({ id: 'reset-1' });
    mailServiceMock.sendPasswordResetEmail.mockResolvedValue(undefined);

    await expect(service.forgotPassword({ email: 'usuario@teste.com' })).resolves.toEqual({
      message: 'E-mail de recuperação enviado.',
    });

    expect(passwordResetTokenMock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      }),
    });
    expect(mailServiceMock.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: 'usuario@teste.com',
      recipientName: 'Usuario Teste',
      resetUrl: expect.stringMatching(
        /^http:\/\/localhost:3001\/recuperar-senha\?token=[a-f0-9]{64}$/,
      ),
      expiresInMinutes: 30,
    });
  });

  it('deve rejeitar token de recuperacao expirado', async () => {
    passwordResetTokenMock.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() - 1_000),
      usedAt: null,
      user: { isActive: true },
    });

    await expect(
      service.resetPassword({ token: 'a'.repeat(64), password: 'NovaSenha@123' }),
    ).rejects.toThrow(new BadRequestException('Token inválido ou expirado'));

    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('deve atualizar a senha e consumir o token uma unica vez', async () => {
    passwordResetTokenMock.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      user: { isActive: true },
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('nova-senha-hash');
    transactionClientMock.passwordResetToken.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    transactionClientMock.user.update.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.resetPassword({ token: 'b'.repeat(64), password: 'NovaSenha@123' }),
    ).resolves.toEqual({ message: 'Senha alterada com sucesso.' });

    expect(bcrypt.hash).toHaveBeenCalledWith('NovaSenha@123', 10);
    expect(transactionClientMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'nova-senha-hash' },
    });
  });

  it('deve rejeitar quando o token ja foi consumido por outra requisicao', async () => {
    passwordResetTokenMock.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      user: { isActive: true },
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('nova-senha-hash');
    transactionClientMock.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.resetPassword({ token: 'c'.repeat(64), password: 'NovaSenha@123' }),
    ).rejects.toThrow(new BadRequestException('Token inválido ou expirado'));

    expect(transactionClientMock.user.update).not.toHaveBeenCalled();
  });
});
