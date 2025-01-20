import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class SendNotificationDto {
    @IsArray()
    @IsNotEmpty()
    tokens: string[];

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsOptional()
    data?: Record<string, any>;
}
