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
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { OtpService } from 'src/otp/otp.service';
import { MailService } from 'src/mail/mail.service';
import { Role, Specialties, UserStatus } from './enum';
import { GoogleUser } from './types';
import { RequestSuspensionReviewDto } from './dto/request-suspension-review.dto';
import * as ejs from 'ejs';
import * as path from 'path';

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
      role: signupDto.role || Role.USER, // Set default role to USER if not specified
      specialties: signupDto.specialties ? signupDto.specialties.map(specialty => Specialties[specialty]) : [],
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
    const user = await this.userRepository.findOne({ where: { email: signinDto.email } });
    if (!user || !(await bcrypt.compare(signinDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended due to a policy violation. Please contact support for more information.');
    }
    if (!user.confirmEmail) {
      throw new BadRequestException('Email not confirmed. Please check your email to confirm your account.');
    }

    const accessToken = this.jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async googleSignin(user: GoogleUser) {
    let existingUser = await this.userRepository.findOne({ where: { email: user.email } });
   
    if (!existingUser) {
      const username = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
      existingUser = this.userRepository.create({
        email: user.email,
        username: username,
        profilePicture: user.picture,
        confirmEmail: true,
        role: Role.USER, 
      });
      await this.userRepository.save(existingUser);
    }

    const accessToken = this.jwtService.sign({ userId: existingUser.id, email: existingUser.email }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ userId: existingUser.id, email: existingUser.email }, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_SECRET') });
      const accessToken = this.jwtService.sign({ userId: payload.userId, email: payload.email }, { expiresIn: '15m' });
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
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

  async sendConfirmationEmail(email: string, confirmationUrl: string) {
    const subject = 'Email Confirmation';
    const templatePath = path.join(process.cwd(), 'src/mail/templates/confirm-email.ejs');
    const html = await ejs.renderFile(templatePath, { confirmationUrl });

    await this.mailService.sendEmail(email, subject, html);
  }

  private async sendResetPasswordEmail(email: string, resetUrl: string) {
    const subject = 'Password Reset';
    const templatePath = path.join(process.cwd(), 'src/mail/templates/reset-password.ejs');
    const html = await ejs.renderFile(templatePath, { resetUrl });

    await this.mailService.sendEmail(email, subject, html);
  }

  async requestSuspensionReview(userId: number, requestSuspensionReviewDto: RequestSuspensionReviewDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.SUSPENDED) {
      throw new BadRequestException('User is not suspended');
    }

    const supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
    const subject = 'Suspension Review Request';
    const templatePath = path.join(process.cwd(), 'src/mail/templates/request-suspension-review.ejs');
    const html = await ejs.renderFile(templatePath, { userEmail: user.email, reason: requestSuspensionReviewDto.reason });

    await this.mailService.sendEmail(supportEmail, subject, html);

    return { message: 'Suspension review request sent successfully' };
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
