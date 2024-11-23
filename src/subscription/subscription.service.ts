import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const user = await this.userRepository.findOne({ where: { id: createSubscriptionDto.userId } });
    const coach = await this.userRepository.findOne({ where: { id: createSubscriptionDto.coachId } });

    if (!user || !coach) {
      throw new NotFoundException('User or Coach not found');
    }

    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      user,
      coach,
    } as DeepPartial<Subscription>);

    await this.subscriptionRepository.save(subscription);
    return subscription;
  }

  async findAll() {
    return this.subscriptionRepository.find();
  }

  async findOne(id: number) {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
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

  async remove(id: number) {
    const subscription = await this.findOne(id);
    return this.subscriptionRepository.remove(subscription);
  }
}