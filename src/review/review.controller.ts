import { Controller, Post, Body, Get, Patch, Query, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
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

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update review' })
    @ApiResponse({ status: 200, description: 'Review updated successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async update(@Param('id') id: number, @Req() req: RequestWithUser, @Body() updateReviewDto: UpdateReviewDto) {
        return this.reviewService.update(id, updateReviewDto, req.user.id);
    }

    @Get('average-rating/:coachId')
    @ApiOperation({ summary: 'Get average rating for a coach' })
    @ApiResponse({ status: 200, description: 'Average rating retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No reviews found for this coach' })
    async getAverageRating(@Param('coachId') coachId: number) {
        return this.reviewService.getAverageRating(coachId);
    }

    @Get('coach/:coachId')
    @ApiOperation({ summary: 'Get all reviews for a coach' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No reviews found for this coach' })
    async findAllByCoach(@Param('coachId') coachId: number) {
        return this.reviewService.findAllByCoach(coachId);
    }

    @Get('count-reviewers/:coachId')
    @ApiOperation({ summary: 'Get number of users who reviewed a coach' })
    @ApiResponse({ status: 200, description: 'Number of reviewers retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No reviews found for this coach' })
    async countReviewersByCoach(@Param('coachId') coachId: number) {
        return this.reviewService.countReviewersByCoach(coachId);
    }
}
