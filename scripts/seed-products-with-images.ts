import { config } from 'dotenv';
import { resolve } from 'path';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { v2 as cloudinary } from 'cloudinary';
import ws from 'ws';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Configure Neon to use ws for WebSocket in Node.js environment
neonConfig.webSocketConstructor = ws;

// Verify environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary credentials are not set in .env.local');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Environment loaded');
console.log(`   Database: ${process.env.DATABASE_URL.substring(0, 50)}...`);
console.log(`   Cloudinary: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}\n`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sample product images from Unsplash that we'll upload to Cloudinary
const productImageSources = [
  {
    productName: 'Sterling Silver Rudraksha Bracelet',
    imageUrls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
    ]
  },
  {
    productName: 'Gold-Plated Nepali Om Pendant',
    imageUrls: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800',
    ]
  },
  {
    productName: 'Oxidized Silver Ring - Mandala Design',
    imageUrls: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800',
    ]
  },
  {
    productName: 'Traditional Daura Suruwal Set',
    imageUrls: [
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
    ]
  },
  {
    productName: 'Dhaka Topi - Authentic Nepali Cap',
    imageUrls: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
    ]
  },
  {
    productName: 'Premium Kurta Pajama Set - Navy Blue',
    imageUrls: [
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    ]
  },
  {
    productName: 'Sherpa Wool Jacket - Charcoal',
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1544923246-77d0d52b7f1d?w=800',
    ]
  },
  {
    productName: 'Cotton Pathani Suit - Olive Green',
    imageUrls: [
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800',
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800',
    ]
  },
];

async function uploadImageToCloudinary(imageUrl: string, productName: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'marketplace-products',
      public_id: `${productName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload image for ${productName}:`, error);
    // Return original URL as fallback
    return imageUrl;
  }
}

async function seedProductImages() {
  console.log('🌱 Starting product image seeding...\n');

  try {
    // Get all products from database
    const { rows: products } = await pool.query(
      'SELECT id, name FROM products ORDER BY created_at ASC'
    );

    if (products.length === 0) {
      console.log('❌ No products found in database. Please run seed script first.');
      return;
    }

    console.log(`📦 Found ${products.length} products\n`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageSource = productImageSources[i];

      if (!imageSource) {
        console.log(`⚠️  No image source for product: ${product.name}`);
        continue;
      }

      console.log(`📸 Processing: ${product.name}`);

      // Upload images to Cloudinary
      const cloudinaryUrls: string[] = [];
      for (const imageUrl of imageSource.imageUrls) {
        console.log(`   ⬆️  Uploading image...`);
        const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, product.name);
        cloudinaryUrls.push(cloudinaryUrl);
        console.log(`   ✅ Uploaded: ${cloudinaryUrl}`);
      }

      // Update product with Cloudinary URLs
      await pool.query(
        'UPDATE products SET image_urls = $1 WHERE id = $2',
        [JSON.stringify(cloudinaryUrls), product.id]
      );

      console.log(`   💾 Updated database with ${cloudinaryUrls.length} images\n`);
    }

    console.log('✅ Product image seeding completed successfully!');
    console.log(`📊 Updated ${products.length} products with Cloudinary images`);

  } catch (error) {
    console.error('❌ Error seeding product images:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedProductImages()
  .then(() => {
    console.log('\n🎉 All done! Your products now have images.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
