import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface PasswordResetEmail {
  to: string;
  recipientName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetEmail(email: PasswordResetEmail) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM') ?? user;
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const secure =
      (this.configService.get<string>('SMTP_SECURE') ?? String(port === 465)).toLowerCase() ===
      'true';

    if (!host || !user || !pass || !from || !Number.isInteger(port)) {
      throw new ServiceUnavailableException('Serviço de e-mail não configurado.');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    const recipientName = this.escapeHtml(email.recipientName);

    try {
      await transporter.sendMail({
        from,
        to: email.to,
        subject: 'Redefinicao de senha - AdotaPet',
        text: [
          `Ola, ${email.recipientName}.`,
          '',
          'Recebemos uma solicitacao para redefinir sua senha no AdotaPet.',
          `Acesse o link abaixo em ate ${email.expiresInMinutes} minutos:`,
          email.resetUrl,
          '',
          'Se voce nao solicitou esta alteracao, ignore este e-mail.',
        ].join('\n'),
        html: `
          <p>Ola, ${recipientName}.</p>
          <p>Recebemos uma solicitacao para redefinir sua senha no AdotaPet.</p>
          <p>
            <a href="${email.resetUrl}">Criar nova senha</a>
          </p>
          <p>Este link expira em ${email.expiresInMinutes} minutos e pode ser usado uma unica vez.</p>
          <p>Se voce nao solicitou esta alteracao, ignore este e-mail.</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        'Falha ao enviar e-mail de recuperação pelo SMTP.',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(
        'Não foi possível enviar o e-mail de recuperação. Verifique a configuração SMTP.',
      );
    }
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return entities[character];
    });
  }
}
