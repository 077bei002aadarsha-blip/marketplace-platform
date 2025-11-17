import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "./schema";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

async function clearProducts() {
  try {
    console.log("Deleting ALL products...");
    
    // Use raw SQL to ensure all products are deleted
    await client`DELETE FROM products`;
    
    console.log("✅ All products deleted!");
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await client.end();
    process.exit(1);
  }
}

clearProducts();
