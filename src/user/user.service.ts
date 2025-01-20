import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchCoachDto } from './dto/search-coach.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, updateProfileDto);
        await this.userRepository.save(user);

        return { message: 'Profile updated successfully' };
    }

    async getProfile(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async searchCoaches(searchCoachDto: SearchCoachDto): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user').where('user.role = :role', { role: 'COACH' });

        if (searchCoachDto.category) {
            query.andWhere('user.category = :category', { category: searchCoachDto.category });
        }

        if (searchCoachDto.specialties) {
            query.andWhere('user.specialties LIKE :specialties', { specialties: `%${searchCoachDto.specialties}%` });
        }

        if (searchCoachDto.availability !== undefined) {
            query.andWhere('user.availability = :availability', { availability: searchCoachDto.availability });
        }

        if (searchCoachDto.minRating) {
            query
                .leftJoinAndSelect('user.coachReviews', 'review')
                .groupBy('user.id')
                .having('AVG(review.rating) >= :minRating', { minRating: searchCoachDto.minRating });
        }

        return query.getMany();
    }
}
