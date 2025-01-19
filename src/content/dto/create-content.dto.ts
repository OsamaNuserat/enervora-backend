import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ContentCategory } from '../enums';

export class CreateContentDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    mediaUrl: string;

    @IsEnum(ContentCategory)
    category: ContentCategory;

    @IsBoolean()
    @IsOptional()
    isSubscriptionBased?: boolean;
}
