import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SigninDto } from './dto/signin.dto';
import { CoachStatus, Role } from './enum';
import { RequestWithUser } from 'src/types/request-with-user';
import { RequestSuspensionReviewDto } from './dto/request-suspension-review.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { SignupCoachDto } from './dto/signup-coach.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup/user')
    @ApiOperation({ summary: 'User Signup' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Conflict' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async signupUser(@Body() signupUserDto: SignupUserDto) {
        return this.authService.signupUser(signupUserDto);
    }

    @Post('signup/coach')
    @ApiOperation({ summary: 'Coach Signup' })
    @ApiResponse({ status: 201, description: 'Coach registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Conflict' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async signupCoach(@Body() signupCoachDto: SignupCoachDto) {
        return this.authService.signupCoach(signupCoachDto);
    }

    @Post('coach/:id/status')
    @ApiOperation({ summary: 'Update coach status' })
    @ApiResponse({ status: 200, description: 'Coach status updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateCoachStatus(@Param('id') userId: number, @Body('coachstatus') coachstatus: CoachStatus) {
        return this.authService.updateCoachStatus(userId, coachstatus);
    }

    @Get('coaches/pending')
    @ApiOperation({ summary: 'Get pending coaches' })
    @ApiResponse({ status: 200, description: 'Pending coaches fetched successfully' })
    async getPendingCoaches() {
        return this.authService.getPendingCoaches();
    }

    @Post('signin')
    @ApiOperation({ summary: 'User signin' })
    @ApiResponse({ status: 200, description: 'User signed in successfully' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async signin(@Body() signinDto: SigninDto) {
        const { accessToken, refreshToken } = await this.authService.signin(signinDto);

        return {
            accessToken,
            refreshToken
        };
    }

    @Post('request-suspension-review')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Request suspension review' })
    @ApiResponse({ status: 200, description: 'Suspension review request sent successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'User is not suspended' })
    async requestSuspensionReview(
        @Req() req: RequestWithUser,
        @Body() requestSuspensionReviewDto: RequestSuspensionReviewDto
    ) {
        return this.authService.requestSuspensionReview(req.user.id, requestSuspensionReviewDto);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Access token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(@Req() req: RequestWithUser) {
        const refreshToken = req.cookies['refreshToken'];
        const { accessToken } = await this.authService.refreshToken(refreshToken);

        return accessToken;
    }

    @Get('confirm-email')
    @ApiOperation({ summary: 'Confirm email' })
    @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid token' })
    async confirmEmail(@Query('token') token: string) {
        return this.authService.confirmEmail(token);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password' })
    @ApiResponse({ status: 200, description: 'Password reset email sent' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(token, resetPasswordDto.newPassword);
    }

    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Current password is incorrect' })
    async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, changePasswordDto);
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
        return this.authService.googleSignin(req.user);
    }

    @Get('admin-only')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin only route' })
    @ApiResponse({ status: 200, description: 'Access granted' })
    async adminOnly() {
        return { message: 'You have access to the admin-only route!' };
    }

    @Get('coach-only')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.COACH)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Coach only route' })
    @ApiResponse({ status: 200, description: 'Access granted' })
    async coachOnly() {
        return { message: 'You have access to the coach-only route!' };
    }

    @Post('send-otp')
    async sendOTP(@Body('phoneNumber') phoneNumber: string): Promise<{ message: string }> {
        await this.authService.sendOTP(phoneNumber);
        return { message: 'OTP sent successfully' };
    }

    @Post('verify-otp')
    async verifyOTP(@Body('phoneNumber') phoneNumber: string, @Body('otp') otp: string): Promise<{ message: string }> {
        await this.authService.verifyOTP(phoneNumber, otp);
        return { message: 'OTP verified successfully' };
    }
}
