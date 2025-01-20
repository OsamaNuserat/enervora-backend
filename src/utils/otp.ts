import {Twilio} from 'twilio';
import * as dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new Twilio(accountSid, authToken);

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

export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
    try {
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: twilioPhoneNumber,
            to: phoneNumber
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
}

export function verifyOTP(otpData: { otp: string; expiresAt: Date }, otp: string): string {
    try {
        if (new Date() > otpData.expiresAt) {
            throw new Error('OTP has expired');
        }
        if (otpData.otp !== otp) {
            throw new Error('Invalid OTP');
        }
        return 'approved';
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Failed to verify OTP');
    }
}
