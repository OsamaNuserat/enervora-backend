// src/auth/dto/signup.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordValidation } from '../decorators/password.decorator';
import { ThemePreferences, Category, Specialties, Role } from '../enum';

export class SignupDto {
  @ApiProperty({ example: 'john_doe' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @PasswordValidation()
  password: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @PasswordValidation()
  confirmPassword: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerPicture?: string;

  @ApiProperty({ example: 'This is my bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: ThemePreferences.DARK, required: false, enum: ThemePreferences })
  @IsOptional()
  @IsEnum(ThemePreferences)
  preferences?: ThemePreferences;

  @ApiProperty({ example: '123-456-7890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: Category.FITNESS, required: false, enum: Category })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiProperty({ example: [Specialties.WEIGHTLIFTING, Specialties.CARDIO], required: false, enum: Specialties, isArray: true })
  @IsOptional()
  @IsEnum(Specialties, { each: true })
  specialties?: Specialties[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  availability?: boolean;

  @ApiProperty({ example: Role.COACH, required: false, enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}