// import * as admin from 'firebase-admin';
// import { ConfigService } from '@nestjs/config';
// import { ServiceAccount } from 'firebase-admin';

// let initialized = false;

// export function initializeFirebase(configService: ConfigService) {
//   if (!initialized) {
//     const serviceAccount: ServiceAccount = {
//       projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
//       privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
//       clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
//     };

//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//       databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
//     });

//     initialized = true;
//     console.log('Firebase Admin SDK initialized successfully');
//   }
// }

// export async function sendPushNotification(token: string, title: string, body: string) {
//   const message = {
//     notification: {
//       title,
//       body,
//     },
//     token,
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Successfully sent message:', response);
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
// }