import * as admin from 'firebase-admin';
import { SendNotificationDto } from 'src/notification/dto/send-notification.dto';

export class FirebaseUtils {
    private static initialized = false;

    static initialize() {
        if (!this.initialized) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            this.initialized = true;
        }
    }

    static async sendNotification(SendNotificationDto: SendNotificationDto) {
        this.initialize();

        const { tokens, title, body, data } = SendNotificationDto;

        const payload = {
            notification: {
                title,
                body
            },
            data
        };

        const responses = await Promise.all(
            tokens.map(token =>
                admin.messaging().send({
                    token,
                    ...payload
                })
            )
        );

        return responses;
    }
}
