import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sendEmail } from './lib/email';

async function testEmail() {
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY);
  try {
    await sendEmail({
      to: '077bei002.aadarsha@pcampus.edu.np',
      subject: 'Test Email from Marketplace',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend integration.</p>',
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail();