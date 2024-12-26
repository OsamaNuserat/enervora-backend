import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerPicture?: string;

  @ApiPropertyOptional({ example: 'This is my bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ThemePreferences.DARK, required: false, enum: ThemePreferences })
  @IsOptional()
  @IsEnum(ThemePreferences)
  preferences?: ThemePreferences;

  @ApiProperty({ example: '+962785422273' })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'Jordan' })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ example: 'New York' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: Category.FITNESS, enum: Category })
  @IsOptional()
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ example: [Specialties.WEIGHTLIFTING, Specialties.CARDIO], enum: Specialties, isArray: true })
  @IsOptional()
  @IsEnum(Specialties, { each: true })
  specialties: Specialties[];

  @ApiPropertyOptional({ example: true, required: false })
  @IsOptional()
  availability?: boolean;

  @ApiPropertyOptional({ example: Role.COACH, required: false, enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}