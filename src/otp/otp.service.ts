import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class OtpService {
  private client: twilio.Twilio;
  private verifyServiceSid: string;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN')
    );
    this.verifyServiceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID');
  }

  async sendOtp(phoneNumber: string) {
    return this.client.verify.v2.services(this.verifyServiceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' })
      .then(verification => verification.sid);
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    return this.client.verify.v2.services(this.verifyServiceSid)
      .verificationChecks
      .create({ to: phoneNumber, code: otp })
      .then(verification_check => verification_check.status);
  }
}