import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { User } from '../auth/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, User]),
    MailModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [TypeOrmModule.forFeature([Subscription])],
})
export class SubscriptionModule {}