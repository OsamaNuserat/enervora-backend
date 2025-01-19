import { Injectable } from '@nestjs/common';
import { FirebaseUtils } from 'src/utils/firebase.utils';

@Injectable()
export class NotificationService {
    async sendPushNotification(tokens: string[], title: string, body: string, data: Record<string, any> = {}) {
        try {
            return await FirebaseUtils.sendNotification(tokens, title, body, data);
        } catch (error) {
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    }
}
