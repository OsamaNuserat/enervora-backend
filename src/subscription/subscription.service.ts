import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { User } from '../auth/entities/user.entity';
import * as moment from 'moment';
import { Role } from 'src/auth/enum';
import { SubscriptionType } from './enums';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const coach = await this.userRepository.findOne({ where: { id: createSubscriptionDto.coachId } });

    if (!user || !coach) {
      throw new NotFoundException('User or Coach not found');
    }

    if (user.role !== Role.USER) {
      throw new BadRequestException('The user must have the role of User');
    }

    if (coach.role !== Role.COACH) {
      throw new BadRequestException('The coach must have the role of Coach');
    }

    const activeSubscription = await this.subscriptionRepository.findOne({ where: { user: { id: userId }, isActive: true } });
    if (activeSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    let endDate: Date;
    if (createSubscriptionDto.subscriptionType === SubscriptionType.MONTHLY) {
      endDate = moment(createSubscriptionDto.startDate).add(1, 'month').toDate();
    } else if (createSubscriptionDto.subscriptionType === SubscriptionType.YEARLY) {
      endDate = moment(createSubscriptionDto.startDate).add(1, 'year').toDate();
    } else {
      throw new BadRequestException('Invalid subscription type');
    }

    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      user,
      coach,
      endDate,
      isActive: true, 
    });

    await this.subscriptionRepository.save(subscription);

    // Increment the subscriber count for the coach
    coach.subscriberCount += 1;
    await this.userRepository.save(coach);

    return subscription;
  }

  async findAll() {
    return this.subscriptionRepository.find();
  }

  async findAllByUser(userId: number) {
    return this.subscriptionRepository.find({ where: { user: { id: userId } } });
  }

  async findAllByCoach(coachId: number) {
    return this.subscriptionRepository.find({ where: { coach: { id: coachId } } });
  }

  async findOne(id: number) {
    const subscription = await this.subscriptionRepository.findOne({ where: { id }, relations: ['coach'] });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionRepository.preload({
      id,
      ...updateSubscriptionDto,
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return this.subscriptionRepository.save(subscription);
  }

  async unsubscribe(userId: number) {
    const activeSubscription = await this.subscriptionRepository.findOne({ where: { user: { id: userId }, isActive: true }, relations: ['coach'] });
    if (!activeSubscription) {
      throw new BadRequestException('User does not have an active subscription');
    }

    activeSubscription.isActive = false;

    const coach = activeSubscription.coach;
    coach.subscriberCount -= 1;
    await this.userRepository.save(coach);

    return this.subscriptionRepository.save(activeSubscription);
  }

  async checkSubscriptions() {
    const subscriptions = await this.subscriptionRepository.find();
    const now = new Date();
    for (const subscription of subscriptions) {
      if (subscription.endDate < now && subscription.isActive) {
        subscription.isActive = false;
        await this.subscriptionRepository.save(subscription);
      }
    }
  }
}