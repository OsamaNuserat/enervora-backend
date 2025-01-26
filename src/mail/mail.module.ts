import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildMailerOptions } from '../utils/mailer-options';
import { MailService } from './mail.service';

@Module({
    imports: [
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => buildMailerOptions(configService),
            inject: [ConfigService]
        })
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
