import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../auth/entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { SubscriptionType } from 'src/subscription/enums';
import * as moment from 'moment';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>
    ) {}

    async create(createPaymentDto: CreatePaymentDto, userId: number) {
        if (!createPaymentDto.paymentDate) {
            createPaymentDto.paymentDate = new Date();
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const subscription = await this.subscriptionRepository.findOne({
            where: { id: createPaymentDto.subscriptionId }
        });
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        const startDate = new Date();
        let endDate: Date;
        if (subscription.subscriptionType === SubscriptionType.MONTHLY) {
            endDate = moment(startDate).add(1, 'month').toDate();
        } else if (subscription.subscriptionType === SubscriptionType.YEARLY) {
            endDate = moment(startDate).add(1, 'year').toDate();
        } else {
            throw new BadRequestException('Invalid subscription type');
        }

        subscription.startDate = startDate;
        subscription.endDate = endDate;
        subscription.gracePeriodEndDate = moment(endDate).add(7, 'days').toDate();
        subscription.isActive = true;

        await this.subscriptionRepository.save(subscription);

        const MAX_RETRIES = 5;
        let retries = 0;
        let payment: Payment;

        while (retries < MAX_RETRIES) {
            try {
                const transactionId = uuidv4();
                payment = this.paymentRepository.create({
                    ...createPaymentDto,
                    transactionId,
                    user,
                    subscription
                });
                return await this.paymentRepository.save(payment);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                    // Unique violation error code for MySQL
                    retries++;
                } else {
                    throw error;
                }
            }
        }

        throw new ConflictException('Could not generate a unique transactionId');
    }

    async findAll() {
        return this.paymentRepository.find();
    }

    async findOne(id: number) {
        return this.paymentRepository.findOne({ where: { id } });
    }
}
