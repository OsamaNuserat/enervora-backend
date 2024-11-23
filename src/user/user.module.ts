import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../auth/entities/user.entity';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), OtpModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}