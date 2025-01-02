import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

let initialized = false;

export function initializeFirebase(configService: ConfigService) {
  if (!initialized) {
    const serviceAccountString = configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
    }

    const serviceAccount = JSON.parse(serviceAccountString.replace(/\\n/g, '\n'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  }
}

export async function sendPushNotification(token: string, title: string, body: string) {
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}