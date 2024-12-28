import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsPhoneNumber } from 'class-validator';
import { PasswordValidation } from '../decorators/password.decorator';

export class SignupUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'john.doe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @PasswordValidation()
  password: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @PasswordValidation()
  confirmPassword: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  postcode: number;
}