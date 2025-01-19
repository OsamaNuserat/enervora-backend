import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordValidation } from '../decorators/password.decorator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'CurrentPassword123!' })
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ example: 'NewPassword123!' })
    @IsNotEmpty()
    @PasswordValidation()
    newPassword: string;
}
