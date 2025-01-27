import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

let client: Twilio;

export function initializeTwilio(configService: ConfigService): void {
    const accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    client = new Twilio(accountSid, authToken);
}

export function generateOTP(): { otp: string; expiresAt: Date } {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        return { otp, expiresAt };
    } catch (error) {
        console.error('Error generating OTP:', error);
        throw new Error('Failed to generate OTP');
    }
}

export async function sendOTP(configService: ConfigService, phoneNumber: string, otp: string): Promise<void> {
    try {
        const twilioPhoneNumber = configService.get<string>('TWILIO_PHONE_NUMBER');
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: twilioPhoneNumber,
            to: phoneNumber,
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
}