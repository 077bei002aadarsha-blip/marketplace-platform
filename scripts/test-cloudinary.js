require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary credentials...\n');
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');
console.log('');

// Test upload from URL
const testImageUrl = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400';

console.log('Uploading test image to Cloudinary...');
cloudinary.uploader.upload(
  testImageUrl,
  {
    folder: 'marketplace-products',
    public_id: 'test-upload-' + Date.now(),
  },
  (error, result) => {
    if (error) {
      console.error('❌ Upload failed:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Upload successful!');
      console.log('URL:', result.secure_url);
      console.log('Public ID:', result.public_id);
      console.log('\n🎉 Cloudinary is configured correctly!');
      process.exit(0);
    }
  }
);
