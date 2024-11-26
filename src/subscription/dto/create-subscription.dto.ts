import { IsDate, IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionType } from '../enums';

export class CreateSubscriptionDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;

  @IsString()
  @IsOptional()
  paymentHistory?: string;

  @IsNumber()
  coachId: number;

  @IsBoolean()
  @IsOptional()
  autoRenewal?: boolean;
}