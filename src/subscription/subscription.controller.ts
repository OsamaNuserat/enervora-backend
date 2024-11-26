import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from '../types/request-with-user';
import { Role } from 'src/auth/enum';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 404, description: 'User or Coach not found' })
  @ApiResponse({ status: 400, description: 'User already has an active subscription' })
  async create(@Req() req: RequestWithUser, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active subscriptions' })
  @ApiResponse({ status: 200, description: 'Active subscriptions retrieved successfully' })
  async findAll(@Req() req: RequestWithUser) {
    if (req.user.role === Role.ADMIN) {
      return this.subscriptionService.findAll();
    } else if (req.user.role === Role.COACH) {
      return this.subscriptionService.findAllByCoach(req.user.id);
    } else if (req.user.role === Role.USER) {
      return this.subscriptionService.findAllByUser(req.user.id);
    } else {
      throw new BadRequestException('Invalid role');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(+id, updateSubscriptionDto);
  }

  @Patch('unsubscribe/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  unsubscribe(@Req() req: RequestWithUser) {
    return this.subscriptionService.unsubscribe(req.user.id);
  }
}