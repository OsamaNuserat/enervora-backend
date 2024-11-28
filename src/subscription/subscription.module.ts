import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { User } from '../auth/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, User]), MailModule, PaymentModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}