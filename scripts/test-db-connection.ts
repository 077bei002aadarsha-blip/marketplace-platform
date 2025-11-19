// Simple script to test database connection
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") });

const connectionString = process.env.DATABASE_URL!;

console.log("Testing database connection...");
console.log("Using connection:", connectionString.replace(/:[^:@]+@/, ':****@'));

const sql = postgres(connectionString, {
  max: 1,
  connect_timeout: 60, // Very long timeout for first connection
  idle_timeout: 20,
  prepare: false,
  ssl: 'require',
  onnotice: () => {}, // Suppress notices
  debug: (connection, query) => {
    console.log('Query:', query?.substring(0, 100));
  }
});

async function testConnection() {
  try {
    console.log("\n🔌 Attempting to connect...");
    
    const result = await sql`SELECT NOW() as current_time, version()`;
    
    console.log("\n✅ Connection successful!");
    console.log("Database time:", result[0].current_time);
    console.log("Version:", result[0].version.substring(0, 50) + "...");
    
    // Test a simple query
    console.log("\n🧪 Testing users table...");
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log("Users count:", users[0].count);
    
    console.log("\n🧪 Testing products table...");
    const products = await sql`SELECT COUNT(*) as count FROM products`;
    console.log("Products count:", products[0].count);
    
    console.log("\n✅ All tests passed! Database is working correctly.");
    
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error code:", (error as Error & { code?: string }).code);
    console.error("Error message:", (error as Error).message);
    
    if ((error as Error & { code?: string }).code === 'CONNECT_TIMEOUT') {
      console.log("\n💡 Troubleshooting tips:");
      console.log("1. Check if your Neon database is active (may be sleeping)");
      console.log("2. Go to https://console.neon.tech and wake up the database");
      console.log("3. Check if a VPN or firewall is blocking port 5432");
      console.log("4. Try switching to a different network");
    }
  } finally {
    await sql.end();
    process.exit(0);
  }
}

testConnection();
