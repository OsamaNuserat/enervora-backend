import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { OtpService } from 'src/otp/otp.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    if (signupDto.password !== signupDto.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = this.userRepository.create({
      ...signupDto,
      password: hashedPassword,
      confirmEmail: false,
    });
    await this.userRepository.save(user);

    const token = this.jwtService.sign({ email: user.email });
    const protocol = this.configService.get<string>('APP_PROTOCOL');
    const host = this.configService.get<string>('APP_HOST');
    const confirmationUrl = `${protocol}://${host}/auth/confirm-email?token=${token}`;
    await this.sendConfirmationEmail(user.email, confirmationUrl);

    return {
      message:
        'User registered successfully. Please check your email to confirm your account.',
    };
  }

  async signin(signinDto: SigninDto) {
    const user = await this.userRepository.findOne({
      where: { email: signinDto.email },
    });
    if (!user || !(await bcrypt.compare(signinDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.confirmEmail) {
      throw new UnauthorizedException(
        'Please confirm your email before signing in.',
      );
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async confirmEmail(token: string) {
    const { email } = this.jwtService.verify(token);
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    user.confirmEmail = true;
    await this.userRepository.save(user);
    return { message: 'Email confirmed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    const protocol = this.configService.get<string>('APP_PROTOCOL');
    const host = this.configService.get<string>('APP_HOST');
    const resetUrl = `${protocol}://${host}/auth/reset-password?token=${token}`;
    await this.sendResetPasswordEmail(user.email, resetUrl);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async sendConfirmationEmail(email: string, token: string) {
    const subject = 'Email Confirmation';
    const text = `Please confirm your email by clicking on the following link: ${token}`;

    await this.mailService.sendEmail(email, subject, text);
  }

  private async sendResetPasswordEmail(email: string, url: string) {
    const subject = 'Password Reset';
    const htmlTemplate = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
    `;

    await this.mailService.sendEmail(email, subject, htmlTemplate);
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
