import { sql } from "../index";
import { readFileSync } from "fs";
import { join } from "path";

async function migrate() {
  try {
    console.log("Running migrations...");

    const migrationSQL = readFileSync(
      join(__dirname, "001_init.sql"),
      "utf-8"
    );

    await sql.unsafe(migrationSQL);

    console.log("✅ Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
