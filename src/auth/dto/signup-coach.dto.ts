import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsPhoneNumber, IsEnum, IsNumber } from 'class-validator';
import { Specialties, Category } from '../enum';
import { PasswordValidation } from '../decorators/password.decorator';

export class SignupCoachDto {
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

  @ApiPropertyOptional({ example: 'This is my bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: Category.FITNESS, enum: Category })
  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ example: [Specialties.WEIGHTLIFTING, Specialties.CARDIO], enum: Specialties, isArray: true })
  @IsNotEmpty()
  @IsEnum(Specialties, { each: true })
  specialties: Specialties[];

  @ApiProperty({ example: 'Jordan' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: ' Amman' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @IsNumber()
  postcode: number;
}