import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from './role.enum';
import { Request } from 'express';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async signup(@Body() signupDto: SignupDto, @Req() req: Request) {
    return this.authService.signup(signupDto, req);
  }

  @Post('signin')
  @ApiOperation({ summary: 'User signin' })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirm email' })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google authentication' })
  async googleAuth() {
    // The AuthGuard('google') will handle the redirection to Google login page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google authentication callback' })
  async googleAuthRedirect(@Req() req) {
    return this.authService.signin(req.user);
  }

  @Get('admin-only')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin only route' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  async adminOnly() {
    return { message: 'You have access to the admin-only route!' };
  }

  @Get('coach-only')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Coach)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Coach only route' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  async coachOnly() {
    return { message: 'You have access to the coach-only route!' };
  }
}