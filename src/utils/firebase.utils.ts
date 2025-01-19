import * as admin from 'firebase-admin';

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

    static async sendNotification(tokens: string[], title: string, body: string, data: Record<string, any> = {}) {
        this.initialize();

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
