# Payment Integration Guide

## Overview
This marketplace supports three payment methods for the Nepali market:
- **eSewa**: Nepal's largest digital wallet (form-based payment)
- **Khalti**: Popular mobile payment platform (widget-based payment)
- **COD**: Cash on Delivery (direct order placement)

## Setup Complete ✅

### 1. Environment Variables (.env.local)
```env
# eSewa Configuration (Test Environment)
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_PRODUCT_CODE=EPAYTEST
NEXT_PUBLIC_ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form

# Khalti Configuration (Test Environment)
KHALTI_PUBLIC_KEY=test_public_key_your_key_here
KHALTI_SECRET_KEY=test_secret_key_your_secret_here
KHALTI_API_URL=https://khalti.com/api/v2

# Callback URLs
NEXT_PUBLIC_PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_PAYMENT_FAILURE_URL=http://localhost:3000/payment/failure
```

### 2. Database Schema
Added to `orders` table:
- `paymentGateway` - VARCHAR(50): Stores "esewa", "khalti", or "cod"
- `transactionId` - VARCHAR(255): Gateway-specific transaction reference

**Migration Status**: 
- ✅ Migration file generated: `drizzle/0002_boring_runaways.sql`
- ⚠️ Migration pending (needs database connection)
- Manual SQL to run:
```sql
ALTER TABLE "orders" ADD COLUMN "payment_gateway" varchar(50);
ALTER TABLE "orders" ADD COLUMN "transaction_id" varchar(255);
```

### 3. Payment Utilities

#### eSewa (`lib/payment/esewa.ts`)
- HMAC-SHA256 signature generation
- Form-based payment initiation
- XML response verification
- Test merchant: EPAYTEST

#### Khalti (`lib/payment/khalti.ts`)
- Token-based verification
- Widget integration
- REST API communication
- Amount conversion (Rs → Paisa: ×100)

### 4. API Endpoints

#### POST /api/payment/initiate
- Requires authentication
- Validates order ownership
- Returns gateway-specific configuration
- Updates order.paymentGateway

#### POST /api/payment/verify
- Verifies payment callback
- Calls gateway verification APIs
- Updates order status: paymentStatus="paid", status="processing"
- Stores transactionId

### 5. Payment Flow

```
User adds items to cart
    ↓
Checkout page (/checkout)
    ↓
Select payment method (eSewa/Khalti/COD)
    ↓
Fill shipping address
    ↓
Click "Proceed to Payment"
    ↓
Order created via POST /api/orders
    ↓
┌─────────────┬──────────────┬──────────────┐
│   eSewa     │   Khalti     │     COD      │
├─────────────┼──────────────┼──────────────┤
│ Form POST   │ Widget opens │ Direct order │
│ to gateway  │ in browser   │ → /orders/id │
│      ↓      │      ↓       │              │
│ Pay on      │ Pay in       │              │
│ eSewa site  │ widget       │              │
│      ↓      │      ↓       │              │
│ Callback to │ Callback to  │              │
│ /payment/   │ /payment/    │              │
│ success     │ success      │              │
└─────────────┴──────────────┴──────────────┘
            ↓
    Verify payment via POST /api/payment/verify
            ↓
    Update order status → "paid" & "processing"
            ↓
    Show success page with order details
```

## Checkout Page Features

### Payment Method Selection
- Visual cards with icons for each method
- Selected method highlighted with colored border
- Descriptions: "Digital Wallet" for eSewa/Khalti, "Cash on Delivery" for COD

### Dynamic Button Text
- eSewa: "Proceed to eSewa Payment"
- Khalti: "Proceed to Khalti Payment"
- COD: "Place Order (COD)"

### Security Notice
- "You will be redirected to secure payment gateway" for digital payments
- "You will pay when you receive the order" for COD

## Payment Pages

### /payment/success
- Three states: Verifying (spinner), Verified (check icon), Error (X icon)
- Automatic verification on page load
- Order details display
- Navigation buttons: "View Order Details", "Continue Shopping"

### /payment/failure
- Error message display
- "Retry Payment" button (returns to checkout)
- Links to home and support

## Testing Instructions

### 1. Test eSewa Payment
1. Add items to cart
2. Go to checkout
3. Select "eSewa" payment method
4. Fill shipping address
5. Click "Proceed to eSewa Payment"
6. On eSewa test page, use test credentials:
   - **eSewa ID**: 9806800001, 9806800002, 9806800003, 9806800004, 9806800005
   - **Password**: Nepal@123
   - **MPIN**: 1234
7. Complete payment
8. Verify redirect to success page
9. Check order status updated to "paid" and "processing"

### 2. Test Khalti Payment
1. Add items to cart
2. Go to checkout
3. Select "Khalti" payment method
4. Fill shipping address
5. Click "Proceed to Khalti Payment"
6. Khalti widget should open
7. Use Khalti test credentials (from Khalti sandbox dashboard)
8. Complete payment
9. Verify callback and order status

### 3. Test COD
1. Add items to cart
2. Go to checkout
3. Select "COD" payment method
4. Fill shipping address
5. Click "Place Order (COD)"
6. Should redirect directly to order page
7. Order status should remain "unpaid" and "pending"

## Production Deployment

### Before Going Live:

1. **Register for Production Accounts**
   - eSewa: https://esewa.com.np/#/merchant
   - Khalti: https://khalti.com/

2. **Update Environment Variables**
   ```env
   # eSewa Production
   ESEWA_MERCHANT_ID=your_production_merchant_id
   ESEWA_SECRET_KEY=your_production_secret_key
   ESEWA_PRODUCT_CODE=your_product_code
   NEXT_PUBLIC_ESEWA_PAYMENT_URL=https://esewa.com.np/epay/main
   
   # Khalti Production
   KHALTI_PUBLIC_KEY=live_public_key_...
   KHALTI_SECRET_KEY=live_secret_key_...
   KHALTI_API_URL=https://khalti.com/api/v2
   
   # Update Callback URLs
   NEXT_PUBLIC_PAYMENT_SUCCESS_URL=https://yourdomain.com/payment/success
   NEXT_PUBLIC_PAYMENT_FAILURE_URL=https://yourdomain.com/payment/failure
   ```

3. **Run Database Migration**
   ```bash
   npm run db:migrate
   ```

4. **Test with Small Amounts**
   - Make test purchases with real small amounts (Rs. 10-50)
   - Verify payment flow end-to-end
   - Check transaction IDs are stored correctly

5. **Enable Production Mode**
   - Remove test credentials
   - Update gateway URLs to production
   - Monitor logs for first few transactions

## Security Considerations

✅ **Implemented**:
- HMAC-SHA256 signature verification for eSewa
- Token verification for Khalti
- Authentication required for payment initiation
- Order ownership validation
- Payment status checks (prevent double payment)
- HTTPS callbacks (required by gateways)

⚠️ **Additional Recommendations**:
- Add rate limiting on payment APIs
- Implement payment timeout handling (15-minute window)
- Log all payment attempts and verifications
- Set up alerts for failed verifications
- Regular transaction reconciliation with gateway statements

## Troubleshooting

### Payment verification fails
- Check environment variables are correct
- Verify callback URLs are accessible from internet
- Ensure amount matches exactly (including decimals for Khalti: paisa)
- Check gateway API credentials

### Order created but payment not initiated
- Check browser console for errors
- Verify Khalti script loaded (check Network tab)
- Ensure payment gateway is not blocked by firewall

### eSewa form submission fails
- Verify signature generation is correct
- Check HMAC key matches gateway configuration
- Ensure all required parameters are present

### Khalti widget doesn't open
- Check Khalti script is loaded: `window.KhaltiCheckout`
- Verify public key is correct
- Check browser console for JavaScript errors

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Install Resend: `npm install resend`
   - Send payment confirmation emails
   - Order status update notifications

2. **Payment Analytics**
   - Dashboard for payment success/failure rates
   - Revenue tracking by gateway
   - Transaction reconciliation report

3. **Refund Support**
   - Admin panel for refund processing
   - Gateway-specific refund APIs
   - Partial refund capability

4. **Payment Retry**
   - Automatic retry for failed payments
   - Save payment preference for user
   - Quick retry from failure page

5. **Additional Payment Methods**
   - Bank transfer integration
   - Connect IPS (Instant Payment System)
   - IME Pay, Prabhu Pay

## Support

### eSewa Support
- Website: https://esewa.com.np
- Email: support@esewa.com.np
- Merchant Support: merchant@esewa.com.np

### Khalti Support
- Website: https://khalti.com
- Email: support@khalti.com
- Merchant Dashboard: https://khalti.com/merchant

### Gateway Documentation
- eSewa API Docs: https://developer.esewa.com.np
- Khalti API Docs: https://docs.khalti.com

---

**Status**: Payment integration complete ✅  
**Version**: 1.0  
**Last Updated**: November 26, 2024
