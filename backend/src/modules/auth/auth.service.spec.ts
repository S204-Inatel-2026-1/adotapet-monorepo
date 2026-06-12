import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Servico de autenticacao', () => {
  let service: AuthService;
  const usersServiceMock = {
    findByEmailForAuth: jest.fn(),
  };
  const jwtServiceMock = {
    signAsync: jest.fn(),
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
});
