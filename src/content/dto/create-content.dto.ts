import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  mediaUrl: string;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  isSubscriptionBased?: boolean;
}