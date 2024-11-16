import { Injectable, ConflictException, UnauthorizedException, Inject, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto, @Req() req: Request) {
    const existingUser = await this.userRepository.findOne({ where: { email: signupDto.email } });
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

    // Send confirmation email
    const token = this.jwtService.sign({ email: user.email });
    const confirmationUrl = `${req.protocol}://${req.get('host')}/auth/confirm-email?token=${token}`;
    await this.sendConfirmationEmail(user.email, confirmationUrl);

    return { message: 'User registered successfully. Please check your email to confirm your account.' };
  }

  async signin(signinDto: SigninDto) {
    const user = await this.userRepository.findOne({
      where: { email: signinDto.email },
    });
    if (!user || !(await bcrypt.compare(signinDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.confirmEmail) {
      throw new UnauthorizedException('Please confirm your email before signing in.');
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

  private async sendConfirmationEmail(email: string, url: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 10px 0;
            background-color: #007bff;
            color: #ffffff;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            padding: 10px 0;
            font-size: 12px;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Confirmation</h1>
          </div>
          <div class="content">
            <p>Thank you for registering. Please confirm your email by clicking on the button below:</p>
            <a href="${url}" class="button">Confirm Email</a>
          </div>
          <div class="footer">
            <p>If you did not request this email, please ignore it.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Confirm your email',
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
  }
}