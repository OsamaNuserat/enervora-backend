import { IsEnum, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { SubscriptionType } from '../enums';

export class CreateSubscriptionDto {
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