# Cloudinary Image Upload Setup Guide

## ✅ Implementation Complete

The Cloudinary image upload feature has been successfully implemented! Here's what was added:

### 📦 Installed Packages
- `cloudinary` - Cloudinary Node.js SDK
- `next-cloudinary` - Next.js integration for Cloudinary

### 🔧 Files Created/Modified

#### 1. Configuration
- **`lib/cloudinary.ts`** - Cloudinary configuration
- **`.env.local`** - Added Cloudinary environment variables

#### 2. API Endpoint
- **`app/api/upload/route.ts`** - Image upload API
  - `POST /api/upload` - Upload image to Cloudinary
  - `DELETE /api/upload` - Delete image from Cloudinary

#### 3. UI Component
- **`components/ImageUpload.tsx`** - Reusable image upload component
  - Drag and drop support
  - Multiple image upload (up to 5)
  - Image preview with delete option
  - Primary image indicator
  - Loading states

#### 4. Updated Forms
- **`app/vendor/products/new/page.tsx`** - Uses ImageUpload component
- **`app/vendor/products/[id]/edit/page.tsx`** - Uses ImageUpload component
- **`app/api/vendor/products/route.ts`** - Accepts imageUrls array
- **`app/api/vendor/products/[id]/route.ts`** - Accepts imageUrls array

---

## 🚀 Setup Instructions

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. Log in to Cloudinary Dashboard
2. Go to **Dashboard** → **Account Details**
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Update Environment Variables
Open `.env.local` and replace the placeholders:

```env
# Cloudinary - Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

### Step 4: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🎯 Features

### Multiple Images
- Upload up to 5 images per product
- First image is marked as "Primary Image"
- Drag and drop or click to upload

### Image Management
- Preview images before submission
- Delete individual images
- Reorder by deleting and re-uploading

### Validation
- Requires at least 1 image
- Validates file types (PNG, JPG, GIF)
- Shows upload progress

### Storage
- Images stored in Cloudinary folder: `marketplace-products`
- Secure URLs returned and stored in database
- Images persist across sessions

---

## 📋 Usage

### For Vendors

#### Adding New Product:
1. Go to **Vendor Dashboard** → **Add Product**
2. Fill in product details
3. Click the upload area or drag images
4. Upload 1-5 product images
5. Submit the form

#### Editing Product:
1. Go to **Vendor Dashboard** → **Products**
2. Click **Edit** on any product
3. Current images will be displayed
4. Delete unwanted images
5. Upload new images if needed
6. Save changes

### Image Best Practices
- Use high-quality images (at least 800x800px)
- First image should be the main product view
- Additional images: different angles, close-ups, etc.
- Keep file sizes under 10MB for faster uploads

---

## 🔒 Security

- Authentication required for all uploads
- Only vendors can upload images
- Images organized by marketplace folder
- API routes protected with JWT authentication

---

## 🧪 Testing

1. **Test Upload**:
   - Navigate to `/vendor/products/new`
   - Try uploading 1-5 images
   - Verify images appear in preview

2. **Test Drag & Drop**:
   - Drag images from file explorer
   - Drop on upload area
   - Confirm upload works

3. **Test Delete**:
   - Hover over uploaded image
   - Click red X button
   - Verify image is removed

4. **Test Form Submission**:
   - Upload images
   - Fill form and submit
   - Check product page shows all images

---

## ❓ Troubleshooting

### Images not uploading?
- Check Cloudinary credentials in `.env.local`
- Ensure dev server was restarted after updating .env
- Check browser console for errors
- Verify Cloudinary account is active

### "Unauthorized" error?
- Make sure you're logged in as a vendor
- Clear cookies and log in again
- Check JWT token is valid

### Upload very slow?
- Check internet connection
- Reduce image file sizes
- Upload fewer images at once

---

## 📊 Cloudinary Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

This should be plenty for development and small-scale production!

---

## 🎉 What's Next?

Now that image upload is working, you can:
1. Test the vendor product flow end-to-end
2. Create products with multiple images
3. Verify images display correctly on product pages
4. Move on to the next Phase 2 feature (Stripe payments or Email notifications)

Enjoy your new image upload feature! 📸
