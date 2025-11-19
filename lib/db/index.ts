import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use Neon's serverless driver which works over WebSocket (port 443)
// This bypasses firewalls that block PostgreSQL port 5432
const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
