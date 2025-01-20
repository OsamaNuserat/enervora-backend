import { Injectable } from '@nestjs/common';
import { FirebaseUtils } from 'src/utils/firebase.utils';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationService {
    async sendPushNotification(sendNotificationDto: SendNotificationDto) {
        try {
            return await FirebaseUtils.sendNotification(sendNotificationDto);
        } catch (error) {
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    }
}
