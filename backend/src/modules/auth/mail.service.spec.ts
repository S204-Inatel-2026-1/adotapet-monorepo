import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MailService', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  });

  it('deve enviar o link pelo SMTP configurado', async () => {
    const values: Record<string, string> = {
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'user@example.com',
      SMTP_PASS: 'app-password',
      SMTP_FROM: 'AdotaPet <user@example.com>',
    };
    const configService = { get: (key: string) => values[key] } as ConfigService;
    const service = new MailService(configService);
    sendMail.mockResolvedValue({ messageId: 'message-1' });

    await service.sendPasswordResetEmail({
      to: 'destino@example.com',
      recipientName: 'Usuario Teste',
      resetUrl: 'http://localhost:3001/recuperar-senha?token=abc',
      expiresInMinutes: 30,
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'user@example.com', pass: 'app-password' },
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'destino@example.com',
        subject: 'Redefinicao de senha - AdotaPet',
        html: expect.stringContaining('recuperar-senha?token=abc'),
      }),
    );
  });

  it('deve rejeitar envio quando o SMTP nao estiver configurado', async () => {
    const configService = { get: jest.fn() } as unknown as ConfigService;
    const service = new MailService(configService);

    await expect(
      service.sendPasswordResetEmail({
        to: 'destino@example.com',
        recipientName: 'Usuario Teste',
        resetUrl: 'http://localhost:3001/recuperar-senha?token=abc',
        expiresInMinutes: 30,
      }),
    ).rejects.toThrow(new ServiceUnavailableException('Serviço de e-mail não configurado.'));

    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('deve ocultar o erro tecnico retornado pelo servidor SMTP', async () => {
    const values: Record<string, string> = {
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'user@example.com',
      SMTP_PASS: 'credencial-invalida',
      SMTP_FROM: 'AdotaPet <user@example.com>',
    };
    const configService = { get: (key: string) => values[key] } as ConfigService;
    const service = new MailService(configService);
    sendMail.mockRejectedValue(new Error('535 Authentication failed'));

    await expect(
      service.sendPasswordResetEmail({
        to: 'destino@example.com',
        recipientName: 'Usuario Teste',
        resetUrl: 'http://localhost:3001/recuperar-senha?token=abc',
        expiresInMinutes: 30,
      }),
    ).rejects.toThrow(
      new ServiceUnavailableException(
        'Não foi possível enviar o e-mail de recuperação. Verifique a configuração SMTP.',
      ),
    );
  });
});
