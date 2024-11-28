import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const coach = await this.userRepository.findOne({ where: { id: createReviewDto.coachId } });

    if (!user || !coach) {
      throw new NotFoundException('User or Coach not found');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
      coach,
    });

    return this.reviewRepository.save(review);
  }

}