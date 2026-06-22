import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('Controlador de autenticacao', () => {
  let controller: AuthController;
  const authServiceMock = {
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve encaminhar solicitacao de recuperacao ao servico', async () => {
    authServiceMock.forgotPassword.mockResolvedValue({ message: 'ok' });

    await expect(controller.forgotPassword({ email: 'usuario@teste.com' })).resolves.toEqual({
      message: 'ok',
    });
    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith({
      email: 'usuario@teste.com',
    });
  });

  it('deve encaminhar redefinicao ao servico', async () => {
    const dto = { token: 'a'.repeat(64), password: 'NovaSenha@123' };
    authServiceMock.resetPassword.mockResolvedValue({ message: 'ok' });

    await expect(controller.resetPassword(dto)).resolves.toEqual({ message: 'ok' });
    expect(authServiceMock.resetPassword).toHaveBeenCalledWith(dto);
  });
});
