import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { OtpService } from 'src/otp/otp.service';
import { MailService } from 'src/mail/mail.service';
import { CoachStatus, Role, Specialties, UserStatus } from './enum';
import { GoogleUser } from './types';
import { RequestSuspensionReviewDto } from './dto/request-suspension-review.dto';
import { renderEmailTemplate } from 'src/utils/email-template.util';
import { generateAvatar, getInitials } from 'src/utils/image-generator.util';
import { SignupUserDto } from './dto/signup-user.dto';
import { SignupCoachDto } from './dto/signup-coach.dto';

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

  async signupUser(signupUserDto: SignupUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: signupUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      if (signupUserDto.password !== signupUserDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }
      const hashedPassword = await bcrypt.hash(signupUserDto.password, 10);

      let profilePicture = signupUserDto.profilePicture;
      if (!profilePicture) {
        const initials = getInitials(signupUserDto.username);
        profilePicture = await generateAvatar(initials);
      }

      const user = this.userRepository.create({
        ...signupUserDto,
        password: hashedPassword,
        profilePicture,
        confirmEmail: false,
        role: Role.USER,
        status : UserStatus.ACTIVE,
      });

      await this.userRepository.save(user);

      const token = this.jwtService.sign({ email: user.email });
      const protocol = this.configService.get<string>('APP_PROTOCOL');
      const host = this.configService.get<string>('APP_HOST');
      const confirmationUrl = `${protocol}://${host}/auth/confirm-email?token=${token}`;
      const html = await renderEmailTemplate('confirm-email', { confirmationUrl });

      await this.mailService.sendEmail(user.email, 'Email Confirmation', html);

      return {
        message: 'User registered successfully. Please check your email to confirm your account.',
      };
    } catch (error) {
      console.error('Error during signup:', error);
      throw new InternalServerErrorException('Signup failed. Please try again later.');
    }
  }

  async signupCoach(signupCoachDto: SignupCoachDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: signupCoachDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      if (signupCoachDto.password !== signupCoachDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }
      const hashedPassword = await bcrypt.hash(signupCoachDto.password, 10);

      let profilePicture = signupCoachDto.profilePicture;
      if (!profilePicture) {
        const initials = getInitials(signupCoachDto.username);
        profilePicture = await generateAvatar(initials);
      }

      const specialties = Array.isArray(signupCoachDto.specialties) ? signupCoachDto.specialties.map(specialty => Specialties[specialty]) : [];

      const user = this.userRepository.create({
        ...signupCoachDto,
        password: hashedPassword,
        profilePicture,
        confirmEmail: false,
        role: Role.COACH,
        specialties,
        category: signupCoachDto.category,
        status : UserStatus.ACTIVE,
        coachstatus: CoachStatus.PENDING
      });

      await this.userRepository.save(user);

      const token = this.jwtService.sign({ email: user.email });
      const protocol = this.configService.get<string>('APP_PROTOCOL');
      const host = this.configService.get<string>('APP_HOST');
      const confirmationUrl = `${protocol}://${host}/auth/confirm-email?token=${token}`;
      const html = await renderEmailTemplate('confirm-email', { confirmationUrl });

      await this.mailService.sendEmail(user.email, 'Email Confirmation', html);

      return {
        message: 'Coach registered successfully. Please check your email to confirm your account.',
      };
    } catch (error) {
      console.error('Error during signup:', error);
      throw new InternalServerErrorException('Signup failed. Please try again later.');
    }
  }

  async updateCoachStatus(userId: number, coachstatus: CoachStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.coachstatus = coachstatus;
    const updatedUser = await this.userRepository.save(user);

    const protocol = this.configService.get<string>('APP_PROTOCOL');
    const host = this.configService.get<string>('APP_HOST');
    const html = await renderEmailTemplate('coach-status-update', {
      name: user.username,
      status: coachstatus,
    });

    await this.mailService.sendEmail(
      user.email,
      `Coach Application ${coachstatus === CoachStatus.APPROVED ? CoachStatus.APPROVED : CoachStatus.REJECTED}`,
      html
    );

    return updatedUser;
  }

  async getPendingCoaches(): Promise<User[]> {
    return this.userRepository.find({ where: { role: Role.COACH, coachstatus: CoachStatus.PENDING } });
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
    const html = await renderEmailTemplate('confirm-email', { confirmationUrl });
    await this.mailService.sendEmail(email, subject, html);
  }

  private async sendResetPasswordEmail(email: string, resetUrl: string) {
    const subject = 'Password Reset';
    const html = await renderEmailTemplate('reset-password', { resetUrl });
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
    const html = await renderEmailTemplate('request-suspension-review', { userEmail: user.email, reason: requestSuspensionReviewDto.reason });
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

  async updateFcmToken(userId: number, fcmToken: string): Promise<void> {
    await this.userRepository.update(userId, { fcmToken });
  }
}
