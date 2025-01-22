import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerOptions } from '@nestjs-modules/mailer';

export function buildMailerOptions(config: ConfigService): MailerOptions {
  return {
    transport: {
      host: config.getOrThrow<string>('MAILER_HOST'),
      port: config.getOrThrow<number>('MAILER_PORT'),
      secure: config.getOrThrow<boolean>('MAILER_SECURE'),
      auth: {
        user: config.getOrThrow<string>('MAILER_USER'),
        pass: config.getOrThrow<string>('MAILER_PASS'),
      },
      pool: true,
    },
    defaults: {
      from: `"No Reply" <${config.getOrThrow<string>('MAILER_USER')}>`,
    },
    template: {
      dir: join(__dirname, '../mail/templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
}