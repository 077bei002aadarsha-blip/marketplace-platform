import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

const sampleProducts = [
  {
    name: "Banarasi Silk Saree - Royal Blue",
    description: "Luxurious handwoven Banarasi silk saree featuring intricate golden zari work. Perfect for weddings and special occasions. Made from pure silk with traditional Mughal-inspired motifs.",
    price: "8999.00",
    category: "saree",
    stockQuantity: 5,
    imageUrl: "/images/products/saree-1.jpg",
    isActive: true,
  },
  {
    name: "Kanjivaram Silk Saree - Emerald Green",
    description: "Authentic Kanjivaram silk saree with temple border design. Rich emerald green color with contrasting maroon pallu. Heavy zari work throughout.",
    price: "12999.00",
    category: "saree",
    stockQuantity: 3,
    imageUrl: "/images/products/saree-2.jpg",
    isActive: true,
  },
  {
    name: "Chanderi Cotton Saree - Peach",
    description: "Lightweight and elegant Chanderi cotton saree in soft peach color. Perfect for daily wear and office. Features subtle silver border.",
    price: "3499.00",
    category: "saree",
    stockQuantity: 15,
    imageUrl: "/images/products/saree-3.jpg",
    isActive: true,
  },
  {
    name: "Gold Plated Kundan Necklace Set",
    description: "Exquisite gold-plated Kundan necklace set with matching earrings. Features intricate meenakari work on the reverse. Comes in a beautiful gift box.",
    price: "5999.00",
    category: "jewelry",
    stockQuantity: 8,
    imageUrl: "/images/products/jewelry-1.jpg",
    isActive: true,
  },
  {
    name: "Pearl Drop Earrings",
    description: "Elegant freshwater pearl drop earrings with silver hooks. Perfect for both traditional and contemporary outfits. Hypoallergenic.",
    price: "1299.00",
    category: "jewelry",
    stockQuantity: 20,
    imageUrl: "/images/products/jewelry-2.jpg",
    isActive: true,
  },
  {
    name: "Oxidized Silver Temple Jewelry Set",
    description: "Traditional temple jewelry set in oxidized silver. Includes necklace, earrings, and maang tikka. Features Goddess Lakshmi motif.",
    price: "3999.00",
    category: "jewelry",
    stockQuantity: 6,
    imageUrl: "/images/products/jewelry-3.jpg",
    isActive: true,
  },
  {
    name: "Embroidered Anarkali Suit - Navy Blue",
    description: "Beautiful navy blue Anarkali suit with golden embroidery. Includes kurta, palazzo pants, and dupatta. Premium georgette fabric.",
    price: "4999.00",
    category: "clothing",
    stockQuantity: 10,
    imageUrl: "/images/products/clothing-1.jpg",
    isActive: true,
  },
  {
    name: "Cotton Kurti Set - Floral Print",
    description: "Comfortable cotton kurti with matching palazzo pants. Vibrant floral print perfect for summer. Machine washable.",
    price: "1999.00",
    category: "clothing",
    stockQuantity: 25,
    imageUrl: "/images/products/clothing-2.jpg",
    isActive: true,
  },
  {
    name: "Designer Lehenga Choli - Maroon",
    description: "Stunning maroon lehenga choli with heavy embroidery and sequin work. Perfect for weddings. Includes blouse and dupatta.",
    price: "15999.00",
    category: "clothing",
    stockQuantity: 4,
    imageUrl: "/images/products/clothing-3.jpg",
    isActive: true,
  },
  {
    name: "Silk Kurta Set - Cream",
    description: "Elegant cream silk kurta with churidar pants. Subtle embroidery on collar and sleeves. Ideal for festive occasions.",
    price: "3999.00",
    category: "clothing",
    stockQuantity: 12,
    imageUrl: "/images/products/clothing-4.jpg",
    isActive: true,
  },
  {
    name: "Embroidered Potli Bag - Golden",
    description: "Beautiful golden potli bag with intricate embroidery and beadwork. Drawstring closure. Perfect for weddings and parties.",
    price: "899.00",
    category: "accessories",
    stockQuantity: 15,
    imageUrl: "/images/products/accessory-1.jpg",
    isActive: true,
  },
  {
    name: "Pashmina Shawl - Pink",
    description: "Soft and warm pashmina shawl in delicate pink. Hand-embroidered border with paisley motifs. Perfect gift item.",
    price: "2999.00",
    category: "accessories",
    stockQuantity: 8,
    imageUrl: "/images/products/accessory-2.jpg",
    isActive: true,
  },
];

async function seed() {
  try {
    console.log("Seeding database...");

    // Insert products
    await db.insert(products).values(sampleProducts);

    console.log("✅ Database seeded successfully!");
    console.log(`Added ${sampleProducts.length} products`);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await client.end();
    process.exit(1);
  }
}

seed();
