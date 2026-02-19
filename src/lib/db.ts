import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/splityuk";

// Only create connection if DATABASE_URL is set (not during build)
const client = process.env.DATABASE_URL ? postgres(connectionString) : null;

export const db = client ? drizzle(client, { schema }) : null as any;

export { schema };
