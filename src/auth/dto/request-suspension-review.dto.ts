import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestSuspensionReviewDto {
  @ApiProperty({ example: 'I believe my account was suspended by mistake. Please review my case.' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}