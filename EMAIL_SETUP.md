# Email Notifications Setup Guide

## Overview
Email notifications are implemented using [Resend](https://resend.com) - a modern email API for developers.

## Features Implemented ✅

### 1. Order Confirmation Email
- Sent immediately when an order is created
- Contains: Order ID, items list, total amount, shipping address
- Sent to customer's email

### 2. Payment Success Email
- Sent after successful payment verification
- Contains: Payment details, transaction ID, payment method
- Includes "View Order Details" button

### 3. Payment Failed Email
- Sent when payment verification fails
- Contains: Order ID, amount
- Includes "Retry Payment" button

### 4. Vendor Approval Email
- Sent when admin approves a vendor application
- Contains: Welcome message, next steps guide
- Includes "Go to Vendor Dashboard" button

### 5. Order Status Update Email
- Sent when order status changes (processing → shipped → delivered)
- Contains: Status updates, tracking number (if available)
- Includes "Track Order" button

## Setup Instructions

### Step 1: Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### Step 2: Get API Key
1. Log in to Resend dashboard
2. Go to "API Keys" section
3. Click "Create API Key"
4. Copy the API key (starts with `re_`)

### Step 3: Update Environment Variables
Open `.env.local` and update:

```env
# Email - Resend
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**For Production:**
1. Add your own domain in Resend dashboard
2. Verify domain ownership (add DNS records)
3. Update `RESEND_FROM_EMAIL` to your domain:
   ```env
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### Step 4: Test Emails

#### Test Order Confirmation:
1. Create an order with a valid email
2. Check your inbox for order confirmation

#### Test Payment Success:
1. Complete a payment with eSewa
2. After verification, check inbox for payment success email

#### Test Vendor Approval:
1. As admin, approve a vendor
2. Vendor will receive approval email

### Step 5: Customize Email Templates

Email templates are in `lib/email.ts`. You can customize:
- Colors and styling
- Email content
- Button text
- Footer information

Example customization:
```typescript
// Change primary color
style="background-color: #2563eb;" // Change to your brand color

// Add your logo
<img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">
```

## Email Template Previews

### Order Confirmation
```
📦 Order Confirmation

Thank you for your order!

Order Details:
- Order ID: abc123
- Total: Rs. 2,500
- Shipping: Kathmandu, Nepal

Order Items:
• Product Name x 2 - Rs. 1,000
• Another Product x 1 - Rs. 1,500
```

### Payment Success
```
✓ Payment Successful

Your payment has been confirmed!

Payment Details:
- Order ID: abc123
- Amount: Rs. 2,500
- Method: ESEWA
- Transaction: TXN123456

[View Order Details]
```

### Vendor Approval
```
🎉 Vendor Account Approved!

Congratulations! You can now start selling.

Next Steps:
1. Log in to vendor dashboard
2. Add your products
3. Set prices
4. Start selling!

[Go to Vendor Dashboard]
```

## Troubleshooting

### Emails Not Sending
1. **Check API Key**: Make sure `RESEND_API_KEY` is correct in `.env.local`
2. **Restart Server**: Restart your dev server after updating env variables
3. **Check Console**: Look for error messages in terminal
4. **Verify Email**: For testing, Resend requires verified recipient emails

### Emails Going to Spam
1. **Add Domain**: Use your own domain instead of `resend.dev`
2. **SPF/DKIM**: Add DNS records provided by Resend
3. **Test with Gmail**: Gmail usually has good spam detection

### Rate Limits
- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Paid Plans**: Start at $20/month for 50,000 emails
- **Solution**: Implement email queuing for high volume

## Best Practices

### 1. Error Handling
Emails are sent in try-catch blocks - order/payment operations don't fail if email fails:
```typescript
try {
  await sendOrderConfirmationEmail({ ... });
} catch (emailError) {
  console.error("Email failed:", emailError);
  // Continue with order processing
}
```

### 2. Testing
- Use your own email for testing
- Check spam folder
- Test all email types before production

### 3. Production Checklist
- [ ] Add your own domain to Resend
- [ ] Verify DNS records (SPF, DKIM, DMARC)
- [ ] Update `RESEND_FROM_EMAIL` to your domain
- [ ] Add company logo to email templates
- [ ] Test with real customers
- [ ] Monitor email delivery rates in Resend dashboard

### 4. Email Queue (Optional)
For high-volume scenarios, implement email queuing:
- Use BullMQ or similar job queue
- Process emails asynchronously
- Retry failed emails

## Email Analytics

Resend provides analytics in the dashboard:
- **Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: How many recipients opened the email
- **Click Rate**: How many clicked links in emails
- **Bounce Rate**: Emails that couldn't be delivered

## Support

### Resend Documentation
- [Getting Started](https://resend.com/docs/introduction)
- [API Reference](https://resend.com/docs/api-reference/introduction)
- [Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)

### Common Issues
- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: Domain not verified
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Resend service issue

---

**Status**: Email notifications fully implemented ✅  
**Next Steps**: Test all email types and customize templates with your branding!
