import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { ConfigService } from '@nestjs/config';
// import { initializeFirebase, sendPushNotification } from '../utils/firebase.utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    // initializeFirebase(this.configService);
  }

  async createNotification(userId: number, message: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const fcmToken = user.fcmToken;
    if (!fcmToken) {
      throw new Error('User does not have a valid FCM token');
    }

    // await sendPushNotification(fcmToken, 'New Notification', message);
  }
}