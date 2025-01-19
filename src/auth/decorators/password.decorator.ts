import { applyDecorators } from '@nestjs/common';
import { Matches, MinLength, IsNotEmpty } from 'class-validator';

export function PasswordValidation() {
    return applyDecorators(
        IsNotEmpty(),
        MinLength(6),
        Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/, {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
        })
    );
}
