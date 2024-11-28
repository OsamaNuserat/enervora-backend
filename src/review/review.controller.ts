import { Controller, Post, Body, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RequestWithUser } from '../types/request-with-user';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(@Req() req: RequestWithUser, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto, req.user.id);
  }

  @Get('average-rating/:coachId')
  @ApiOperation({ summary: 'Get average rating for a coach' })
  @ApiResponse({ status: 200, description: 'Average rating retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No reviews found for this coach' })
  async getAverageRating(@Param('coachId') coachId: number) {
    return this.reviewService.getAverageRating(coachId);
  }
}