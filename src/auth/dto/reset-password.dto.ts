import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordValidation } from '../decorators/password.decorator';

export class ResetPasswordDto {
    @ApiProperty({ example: 'NewPassword123!' })
    @IsNotEmpty()
    @PasswordValidation()
    newPassword: string;
}
