import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SigninDto, SignupDto } from './dto/signing.dto';

@Injectable()
export class AuthService {
  private users = []; // This should be replaced with a proper database

  constructor(private readonly jwtService: JwtService) {}

  async signup(signupDto: SignupDto) {
    if (signupDto.password !== signupDto.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    const user = { id: Date.now(), ...signupDto };
    this.users.push(user);
    return { message: 'User registered successfully' };
  }

  async signin(signinDto: SigninDto) {
    const user = this.users.find(
      (user) => user.email === signinDto.email && user.password === signinDto.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}