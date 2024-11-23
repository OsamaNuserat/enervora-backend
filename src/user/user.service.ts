import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpService: OtpService,
  ) {}

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    return { message: 'Profile updated successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async sendOtp(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpSid = await this.otpService.sendOtp(user.phoneNumber);
    return { message: 'OTP sent successfully', otpSid };
  }

  async verifyOtp(userId: number, otp: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const status = await this.otpService.verifyOtp(user.phoneNumber, otp);
    if (status !== 'approved') {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.otp = null;
    user.otpExpires = null;
    await this.userRepository.save(user);

    return { message: 'Phone number verified successfully' };
  }
}