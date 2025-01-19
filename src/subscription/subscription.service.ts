import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { User } from '../auth/entities/user.entity';
import { Role } from 'src/auth/enum';
import { SubscriptionType } from './enums';
import { MailService } from '../mail/mail.service';
import { PaymentService } from '../payment/payment.service';
import * as moment from 'moment';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailService: MailService,
        private readonly paymentService: PaymentService
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

        const activeSubscription = await this.subscriptionRepository.findOne({
            where: { user: { id: userId }, coach: { id: createSubscriptionDto.coachId }, isActive: true }
        });
        if (activeSubscription && activeSubscription.endDate > new Date()) {
            throw new BadRequestException('User already has an active subscription with this coach');
        }

        const subscription = this.subscriptionRepository.create({
            ...createSubscriptionDto,
            user,
            coach,
            isActive: false
        });

        await this.subscriptionRepository.save(subscription);

        await this.updateSubscriberCount(coach.id);

        return subscription;
    }

    async findAll() {
        return this.subscriptionRepository.find({ where: { isActive: true } });
    }

    async findAllByUser(userId: number) {
        return this.subscriptionRepository.find({ where: { user: { id: userId }, isActive: true } });
    }

    async findAllByCoach(coachId: number) {
        return this.subscriptionRepository.find({ where: { coach: { id: coachId }, isActive: true } });
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
            ...updateSubscriptionDto
        });
        if (!subscription) {
            throw new NotFoundException(`Subscription with ID ${id} not found`);
        }
        return this.subscriptionRepository.save(subscription);
    }

    async unsubscribe(userId: number) {
        const activeSubscription = await this.subscriptionRepository.findOne({
            where: { user: { id: userId }, isActive: true },
            relations: ['coach']
        });
        if (!activeSubscription) {
            throw new BadRequestException('User does not have an active subscription');
        }

        activeSubscription.isActive = false;
        await this.subscriptionRepository.save(activeSubscription);

        // Update the subscriber count for the coach
        await this.updateSubscriberCount(activeSubscription.coach.id);

        return activeSubscription;
    }

    async checkSubscriptions() {
        const subscriptions = await this.subscriptionRepository.find();
        const now = new Date();
        for (const subscription of subscriptions) {
            if (subscription.endDate < now && subscription.isActive) {
                if (subscription.autoRenewal) {
                    let newEndDate: Date;
                    if (subscription.subscriptionType === SubscriptionType.MONTHLY) {
                        newEndDate = moment(subscription.endDate).add(1, 'month').toDate();
                    } else if (subscription.subscriptionType === SubscriptionType.YEARLY) {
                        newEndDate = moment(subscription.endDate).add(1, 'year').toDate();
                    }
                    subscription.endDate = newEndDate;
                    subscription.gracePeriodEndDate = moment(newEndDate).add(7, 'days').toDate();
                } else if (subscription.gracePeriodEndDate < now) {
                    subscription.isActive = false;
                }
                await this.subscriptionRepository.save(subscription);
            }
        }
    }

    async createPayment(createPaymentDto: CreatePaymentDto, userId: number) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { id: createPaymentDto.subscriptionId },
            relations: ['payments']
        });
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        const payment = await this.paymentService.create(createPaymentDto, userId);
        subscription.payments.push(payment);
        await this.subscriptionRepository.save(subscription);

        return payment;
    }

    private async updateSubscriberCount(coachId: number) {
        const subscriberCount = await this.subscriptionRepository.count({
            where: { coach: { id: coachId }, isActive: true }
        });

        await this.userRepository.update(coachId, { subscriberCount });
    }

    async sendNotifications() {
        const subscriptions = await this.subscriptionRepository.find();
        const now = new Date();
        for (const subscription of subscriptions) {
            if (subscription.endDate < now && !subscription.notificationSent) {
                // Send notification to the user
                const user = subscription.user;
                const subject = 'Subscription Expiry Notification';
                const text = `Dear ${user.username}, your subscription will expire soon. Please renew your subscription to continue enjoying our services.`;

                await this.mailService.sendEmail(user.email, subject, text);

                subscription.notificationSent = true;
                await this.subscriptionRepository.save(subscription);
            }
        }
    }
}
