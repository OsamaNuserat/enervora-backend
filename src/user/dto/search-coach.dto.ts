import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class SearchCoachDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    specialties?: string;

    @IsOptional()
    @IsBoolean()
    availability?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    minRating?: number;
}
