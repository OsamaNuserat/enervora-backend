import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/enum';

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

    if (coach.role !== Role.COACH) {
      throw new BadRequestException('You can only review users with the role of COACH');
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

  async update(reviewId: number, updateReviewDto: UpdateReviewDto, userId: number) {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId, user: { id: userId } }, relations: ['user'] });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }

    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    return this.reviewRepository.save(review);
  }

  async getAverageRating(coachId: number): Promise<number> {
    const reviews = await this.reviewRepository.find({ where: { coach: { id: coachId } }, relations: ['user'] });
    if (reviews.length === 0) {
      throw new NotFoundException('No reviews found for this coach');
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }

  async findAllByCoach(coachId: number) {
    return this.reviewRepository.find({ where: { coach: { id: coachId } }, relations: ['user'] });
  }

  async countReviewersByCoach(coachId: number): Promise<number> {
    const count = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(DISTINCT review.userId)', 'count')
      .where('review.coachId = :coachId', { coachId })
      .getRawOne();

    return parseInt(count.count, 10);
  }
}