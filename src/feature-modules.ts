import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ReviewModule } from './review/review.module';
import { ContentModule } from './content/content.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';

export const featureModules = [
  AuthModule,
  PaymentModule,
  SubscriptionModule,
  ReviewModule,
  ContentModule,
  MailModule,
  OtpModule,
  UserModule,
  NotificationModule,
];