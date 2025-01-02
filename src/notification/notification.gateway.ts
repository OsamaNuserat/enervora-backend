import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {}

  @SubscribeMessage('sendNotification')
  async handleSendNotification(@MessageBody() data: { userId: number; message: string }) {
    try {
      await this.notificationService.createNotification(data.userId, data.message);
      this.server.emit('notification', { userId: data.userId, message: data.message });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}