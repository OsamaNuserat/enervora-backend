import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Category, Specialties } from 'src/auth/enum';

export class UpdateProfileDto {
    @ApiProperty({ example: 'john_doe', required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ example: 'john.doe@example.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiProperty({ example: 'https://example.com/banner.jpg', required: false })
    @IsOptional()
    @IsString()
    bannerPicture?: string;

    @ApiProperty({ example: 'This is my bio', required: false })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiProperty({ example: '123-456-7890', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ example: 'USA', required: false })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({ example: 'New York', required: false })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ example: Category.FITNESS, required: false, enum: Category })
    @IsOptional()
    @IsEnum(Category)
    category?: Category;

    @ApiProperty({
        example: [Specialties.WEIGHTLIFTING, Specialties.CARDIO],
        required: false,
        enum: Specialties,
        isArray: true
    })
    @IsOptional()
    @IsEnum(Specialties, { each: true })
    specialties?: Specialties[];

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    availability?: boolean;
}
