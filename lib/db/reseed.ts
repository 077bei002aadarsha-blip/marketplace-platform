import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

const sampleProducts = [
  // Jewelry
  {
    name: "Sterling Silver Rudraksha Bracelet",
    description: "Authentic 5-mukhi Rudraksha beads set in 925 sterling silver. Traditional design with adjustable chain. Spiritual and stylish for everyday wear.",
    price: "2499.00",
    category: "jewelry",
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
    isActive: true,
  },
  {
    name: "Gold-Plated Nepali Om Pendant",
    description: "Handcrafted Om symbol pendant in 18k gold-plated brass. Includes stainless steel chain. Perfect for meditation and daily wear.",
    price: "1899.00",
    category: "jewelry",
    stockQuantity: 20,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    isActive: true,
  },
  {
    name: "Oxidized Silver Ring - Mandala Design",
    description: "Bold oxidized silver ring featuring intricate mandala pattern. Adjustable size. Traditional Nepali craftsmanship.",
    price: "1299.00",
    category: "jewelry",
    stockQuantity: 25,
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
    isActive: true,
  },
  
  // Clothing
  {
    name: "Traditional Daura Suruwal Set",
    description: "Authentic Nepali national dress for men. Hand-stitched cotton Daura (shirt) with matching Suruwal (pants). Available in off-white.",
    price: "4999.00",
    category: "clothing",
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=500",
    isActive: true,
  },
  {
    name: "Dhaka Topi - Authentic Nepali Cap",
    description: "Handwoven traditional Dhaka fabric cap. Symbol of Nepali identity. One size fits most. Perfect for cultural occasions.",
    price: "899.00",
    category: "clothing",
    stockQuantity: 30,
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
    isActive: true,
  },
  {
    name: "Premium Kurta Pajama Set - Navy Blue",
    description: "Elegant navy blue cotton kurta with matching pajama pants. Mandarin collar with button placket. Ideal for festivals and formal events.",
    price: "3499.00",
    category: "clothing",
    stockQuantity: 12,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    isActive: true,
  },
  {
    name: "Sherpa Wool Jacket - Charcoal",
    description: "Authentic Himalayan wool jacket. Hand-knitted by local artisans. Warm and comfortable for cold weather. Features traditional patterns.",
    price: "6999.00",
    category: "clothing",
    stockQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
    isActive: true,
  },
  {
    name: "Cotton Pathani Suit - Olive Green",
    description: "Classic Pathani-style kurta set in premium cotton. Olive green with contrast piping. Includes kurta and salwar pants.",
    price: "2999.00",
    category: "clothing",
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500",
    isActive: true,
  },
  
  // Accessories
  {
    name: "Handcrafted Khukuri - Ceremonial",
    description: "Authentic Nepali Khukuri knife with carved wooden handle. Ceremonial grade with decorative sheath. Symbol of bravery and honor.",
    price: "8999.00",
    category: "accessories",
    stockQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1595131486851-5293c2760e4e?w=500",
    isActive: true,
  },
  {
    name: "Pashmina Scarf - Charcoal Grey",
    description: "Luxurious 100% pure Pashmina wool scarf. Hand-woven in the Himalayas. Ultra-soft and warm. Perfect for winter.",
    price: "5999.00",
    category: "accessories",
    stockQuantity: 10,
    imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500",
    isActive: true,
  },
  {
    name: "Leather Wallet - Handmade",
    description: "Premium buffalo leather wallet with traditional embossed design. Multiple card slots and coin pocket. Made in Kathmandu.",
    price: "1499.00",
    category: "accessories",
    stockQuantity: 20,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
    isActive: true,
  },
  {
    name: "Hemp Backpack - Eco-Friendly",
    description: "Durable hemp canvas backpack. Multiple compartments with laptop sleeve. Handmade by Nepali artisans. Sustainable and stylish.",
    price: "3999.00",
    category: "accessories",
    stockQuantity: 12,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    isActive: true,
  },
];

async function reseed() {
  try {
    console.log("Clearing existing products...");
    await db.delete(products);
    
    console.log("Seeding database with new products...");
    await db.insert(products).values(sampleProducts);

    console.log("✅ Database reseeded successfully!");
    console.log(`Added ${sampleProducts.length} male-focused Nepalese products`);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error reseeding database:", error);
    await client.end();
    process.exit(1);
  }
}

reseed();
