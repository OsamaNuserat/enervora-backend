import { IsDate, IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {
  @IsDate()
  startDate: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  paymentHistory?: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  coachId: number;
}