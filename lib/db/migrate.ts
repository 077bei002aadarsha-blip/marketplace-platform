import { sql } from "./index";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  try {
    console.log("Running migrations...");
    
    await migrate(drizzle(migrationClient), {
      migrationsFolder: "./drizzle",
    });

    console.log("✅ Migrations completed!");
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
