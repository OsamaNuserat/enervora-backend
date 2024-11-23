import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThemePreferences } from 'src/auth/enum';

export class UpdateProfileDto {
  @ApiProperty({ example: 'john_doe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg', required: false })
  @IsOptional()
  @IsString()
  bannerPicture?: string;

  @ApiProperty({ example: 'This is my bio', required: false })
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

  @ApiProperty({ example: 'Active', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}