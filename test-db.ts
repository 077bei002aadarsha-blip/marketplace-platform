import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);

async function test() {
  try {
    console.log("Testing connection...");
    const result = await sql`SELECT 1 as test`;
    console.log("✅ Database connected successfully!");
    console.log("Result:", result);
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
}

test();
