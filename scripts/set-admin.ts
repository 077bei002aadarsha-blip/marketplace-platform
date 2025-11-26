/**
 * Script to set a user as admin
 * Run with: npm run tsx scripts/set-admin.ts <email>
 */

import "dotenv/config";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run tsx scripts/set-admin.ts <email>");
  process.exit(1);
}

async function setAdmin() {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id));

    console.log(`✅ Successfully set ${email} as admin`);
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin:", error);
    process.exit(1);
  }
}

setAdmin();
