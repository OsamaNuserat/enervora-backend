import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(
    @Body('tokens') tokens: string[],
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data: Record<string, any>,
  ) {
    return this.notificationService.sendPushNotification(tokens, title, body, data);
  }
}
