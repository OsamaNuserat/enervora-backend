import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('send')
    async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
        return this.notificationService.sendPushNotification(sendNotificationDto);
    }
}
