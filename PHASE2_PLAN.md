# Phase 2 Implementation Plan - Luga Marketplace

## 🎯 Implementation Order

### Week Breakdown

#### **Days 1-2: Database & Vendor System** ⏱️
- [ ] Update database schema (vendors, roles, payment fields)
- [ ] Run migrations
- [ ] Create vendor registration API
- [ ] Build vendor dashboard UI
- [ ] Implement role-based middleware
- [ ] Add vendor product CRUD

#### **Days 3-4: Payment & Image Upload** 💳📸
- [ ] Set up Cloudinary account
- [ ] Implement image upload API
- [ ] Build multi-image upload UI
- [ ] Set up Stripe account (test mode)
- [ ] Create Stripe checkout API
- [ ] Implement webhook handler
- [ ] Build payment success/cancel pages

#### **Day 5: Email System** 📧
- [ ] Set up Resend account
- [ ] Create email templates (React Email)
- [ ] Implement email sending functions
- [ ] Test all email triggers
- [ ] Add email to registration flow
- [ ] Add email to order flow

#### **Days 6-7: Analytics & Polish** 📊✨
- [ ] Build admin dashboard
- [ ] Implement charts (Recharts)
- [ ] Add order status tracking UI
- [ ] Create vendor analytics page
- [ ] Final testing
- [ ] Update documentation

---

## 📦 Dependencies to Install

```bash
# Payment
npm install stripe @stripe/stripe-js

# Image upload
npm install cloudinary next-cloudinary

# Email
npm install resend react-email @react-email/components

# Charts
npm install recharts

# File upload UI
npm install react-dropzone

# Additional utilities
npm install date-fns
```

---

## 🗄️ Database Changes Summary

### New Tables
1. **vendors** - Store vendor business information
2. **product_images** - Multiple images per product
3. **order_status_history** - Track status changes

### Updated Tables
1. **users** - Add role field (customer/vendor/admin), phone
2. **products** - Add vendor_id, change imageUrl to support multiple
3. **orders** - Add payment fields, shipping details, tracking

---

## 🔐 Environment Variables to Add

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## 🎨 New UI Pages to Build

### Vendor Portal
- `/vendor/register` - Vendor registration form
- `/vendor/dashboard` - Analytics overview
- `/vendor/products` - Product management
- `/vendor/products/new` - Add product
- `/vendor/products/[id]/edit` - Edit product
- `/vendor/orders` - Order management

### Admin Portal
- `/admin/dashboard` - Admin analytics
- `/admin/vendors` - Vendor management
- `/admin/orders` - All orders view

### Payment
- `/checkout` - Update with Stripe
- `/payment/success` - Success page
- `/payment/cancel` - Cancel page

---

## 🚀 Implementation Steps

### Step 1: Schema Update ✅
Create new schema file with all Phase 2 tables

### Step 2: Migrations 🔄
Generate and run migrations for new schema

### Step 3: Vendor Registration 👤
- API endpoint
- Registration form
- Profile management

### Step 4: Product Management with Images 📸
- Multi-image upload
- Cloudinary integration
- Product CRUD for vendors

### Step 5: Stripe Integration 💳
- Checkout session creation
- Webhook handling
- Payment verification

### Step 6: Email System 📧
- Template creation
- Sending logic
- Trigger points

### Step 7: Analytics Dashboards 📊
- Vendor dashboard
- Admin dashboard
- Charts and metrics

---

## ✅ Testing Checklist

### Vendor Features
- [ ] Vendor can register
- [ ] Vendor can add products with images
- [ ] Vendor can edit/delete products
- [ ] Vendor sees only their orders
- [ ] Vendor can update order status
- [ ] Vendor sees analytics

### Payment
- [ ] Checkout redirects to Stripe
- [ ] Test payment (4242...) works
- [ ] Webhook creates order
- [ ] Success page displays correctly
- [ ] Cancel returns to cart

### Emails
- [ ] Welcome email received
- [ ] Order confirmation sent
- [ ] Status updates trigger emails
- [ ] Vendor order notifications work

### Admin
- [ ] Dashboard shows metrics
- [ ] Can approve vendors
- [ ] Can view all orders
- [ ] Can process refunds

---

## 🎯 Success Metrics

By end of Phase 2, you should have:
- ✅ 3 user roles working (customer, vendor, admin)
- ✅ Real payment processing (Stripe test mode)
- ✅ Cloud image storage (Cloudinary)
- ✅ Automated emails (5+ templates)
- ✅ 2 analytics dashboards (vendor & admin)
- ✅ 15+ new API endpoints
- ✅ 10+ new UI pages

---

**Ready to start? Let's build! 🚀**
