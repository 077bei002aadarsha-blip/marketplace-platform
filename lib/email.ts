import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });


    return { success: true, data };
  } catch (error) {
    // Email sending failed silently - non-critical
    return { success: false, error };
  }
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail({
  to,
  orderId,
  totalAmount,
  shippingAddress,
  items,
}: {
  to: string;
  orderId: string;
  totalAmount: string;
  shippingAddress: string;
  items: Array<{ name: string; quantity: number; price: string }>;
}) {
  const itemsList = items
    .map(
      (item) =>
        `<li style="margin-bottom: 10px;">
          <strong>${item.name}</strong> x ${item.quantity} - Rs. ${parseFloat(item.price).toLocaleString("en-NP")}
        </li>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Order Confirmation</h1>
          
          <p>Thank you for your order! We've received your order and will process it soon.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Order Details</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> Rs. ${parseFloat(totalAmount).toLocaleString("en-NP")}</p>
            <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Order Items</h2>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
          </div>

          <p style="margin-top: 20px;">You'll receive another email once your order has been shipped.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmation - #${orderId.slice(0, 8)}`,
    html,
  });
}

// Payment Success Email
export async function sendPaymentSuccessEmail({
  to,
  orderId,
  totalAmount,
  transactionId,
  paymentGateway,
}: {
  to: string;
  orderId: string;
  totalAmount: string;
  transactionId: string;
  paymentGateway: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; border: 2px solid #10b981;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 50px; font-size: 18px;">
              ✓ Payment Successful
            </div>
          </div>
          
          <h1 style="color: #059669; margin-bottom: 20px; text-align: center;">Payment Confirmed!</h1>
          
          <p style="text-align: center;">Your payment has been processed successfully.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Payment Details</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount Paid:</strong> Rs. ${parseFloat(totalAmount).toLocaleString("en-NP")}</p>
            <p><strong>Payment Method:</strong> ${paymentGateway.toUpperCase()}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
          </div>

          <p style="margin-top: 20px; text-align: center;">We're now processing your order and will ship it soon!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Order Details
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1fae5;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Thank you for shopping with us!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Payment Successful - Order #${orderId.slice(0, 8)}`,
    html,
  });
}

// Payment Failed Email
export async function sendPaymentFailedEmail({
  to,
  orderId,
  totalAmount,
}: {
  to: string;
  orderId: string;
  totalAmount: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; border: 2px solid #ef4444;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; border-radius: 50px; font-size: 18px;">
              ✗ Payment Failed
            </div>
          </div>
          
          <h1 style="color: #dc2626; margin-bottom: 20px; text-align: center;">Payment Unsuccessful</h1>
          
          <p style="text-align: center;">We couldn't process your payment for the following order:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> Rs. ${parseFloat(totalAmount).toLocaleString("en-NP")}</p>
          </div>

          <p style="margin-top: 20px;">Don't worry! Your order is still reserved. You can try again:</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout?retry=${orderId}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Retry Payment
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fecaca;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              If you continue to experience issues, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Payment Failed - Order #${orderId.slice(0, 8)}`,
    html,
  });
}

// Vendor Approval Email
export async function sendVendorApprovalEmail({
  to,
  vendorName,
}: {
  to: string;
  vendorName: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px;">
          <h1 style="color: #059669; margin-bottom: 20px;">🎉 Vendor Account Approved!</h1>
          
          <p>Hello ${vendorName},</p>
          
          <p>Congratulations! Your vendor account has been approved. You can now start selling on our platform.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Next Steps:</h2>
            <ol style="color: #4b5563;">
              <li style="margin-bottom: 10px;">Log in to your vendor dashboard</li>
              <li style="margin-bottom: 10px;">Add your products with images and descriptions</li>
              <li style="margin-bottom: 10px;">Set competitive prices</li>
              <li style="margin-bottom: 10px;">Start selling!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to Vendor Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1fae5;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, feel free to reach out to our vendor support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Vendor Account Approved - Start Selling Now!",
    html,
  });
}

// Order Status Update Email
export async function sendOrderStatusEmail({
  to,
  orderId,
  status,
  trackingNumber,
}: {
  to: string;
  orderId: string;
  status: string;
  trackingNumber?: string;
}) {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    processing: {
      title: "Order is Being Processed",
      message: "We're preparing your order for shipment.",
      color: "#f59e0b",
    },
    shipped: {
      title: "Order Shipped",
      message: "Your order is on its way to you!",
      color: "#3b82f6",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been delivered successfully.",
      color: "#10b981",
    },
  };

  const statusInfo = statusMessages[status] || statusMessages.processing;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: ${statusInfo.color}; color: white; padding: 10px 20px; border-radius: 50px; font-size: 18px;">
              ${statusInfo.title}
            </div>
          </div>
          
          <p style="text-align: center; font-size: 16px;">${statusInfo.message}</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
            ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Order
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Thank you for shopping with us!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Order Update - ${statusInfo.title} #${orderId.slice(0, 8)}`,
    html,
  });
}
