import { IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '../enums';

export class CreatePaymentDto {
    @IsNumber()
    subscriptionId: number;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsDate()
    paymentDate?: Date;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}
