import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { User } from '../auth/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Review, User])],
    providers: [ReviewService],
    controllers: [ReviewController]
})
export class ReviewModule {}
