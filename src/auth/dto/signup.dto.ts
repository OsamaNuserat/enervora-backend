import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordValidation } from '../decorators/password.decorator';

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
}