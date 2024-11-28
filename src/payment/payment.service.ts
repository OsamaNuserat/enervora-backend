import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: number) {
    if (!createPaymentDto.paymentDate) {
      createPaymentDto.paymentDate = new Date();
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
        });
        return await this.paymentRepository.save(payment);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) { // Unique violation error code for MySQL
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