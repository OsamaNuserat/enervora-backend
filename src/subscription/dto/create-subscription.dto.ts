import { Type } from 'class-transformer';
import {
  IsDate,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
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
