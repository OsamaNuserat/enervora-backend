import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    if (userId === createReviewDto.coachId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { user: { id: userId }, coach: { id: createReviewDto.coachId } },
    });

    if (existingReview) {
      throw new BadRequestException('You have already submitted a review for this coach');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
      coach,
    });

    return this.reviewRepository.save(review);
  }

  async getAverageRating(coachId: number): Promise<number> {
    const reviews = await this.reviewRepository.find({ where: { coach: { id: coachId } } });
    if (reviews.length === 0) {
      throw new NotFoundException('No reviews found for this coach');
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
}