/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "./logger";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

// Email functionality disabled - all email functions are no-ops
export async function sendEmail({ to, subject }: EmailParams) {
  logger.info(`Email sending disabled - would have sent to ${to} with subject: ${subject}`);
  return { success: true, data: null };
}

export async function sendOrderConfirmationEmail(params: any) {
  logger.info(`Order confirmation email disabled - orderId: ${params.orderId}`);
  return { success: true, data: null };
}

export async function sendPaymentSuccessEmail(params: any) {
  logger.info(`Payment success email disabled - orderId: ${params.orderId}`);
  return { success: true, data: null };
}

export async function sendPaymentFailedEmail(params: any) {
  logger.info(`Payment failed email disabled - orderId: ${params.orderId}`);
  return { success: true, data: null };
}

export async function sendVendorApprovalEmail(params: any) {
  logger.info(`Vendor approval email disabled - to: ${params.to}`);
  return { success: true, data: null };
}

export async function sendOrderStatusEmail(params: any) {
  logger.info(`Order status email disabled - orderId: ${params.orderId}, status: ${params.status}`);
  return { success: true, data: null };
}
