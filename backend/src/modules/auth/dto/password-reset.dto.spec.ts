import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';

describe('Password reset DTOs', () => {
  it('deve normalizar o email de recuperacao', async () => {
    const dto = plainToInstance(ForgotPasswordDto, {
      email: '  USUARIO@ADOTAPET.COM  ',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.email).toBe('usuario@adotapet.com');
  });

  it('deve rejeitar email invalido', async () => {
    const dto = plainToInstance(ForgotPasswordDto, { email: 'email-invalido' });

    expect((await validate(dto)).some((error) => error.property === 'email')).toBe(true);
  });

  it('deve aceitar token e senha forte', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'a'.repeat(64),
      password: 'NovaSenha@123',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar token curto e senha fraca', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'curto',
      password: '12345678',
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'token')).toBe(true);
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
