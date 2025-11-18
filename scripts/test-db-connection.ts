/**
 * Simple script to test database connection
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { db } from "../db";
import { users } from "../db/schema";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set ✓" : "Not set ✗");

    // Try a simple query
    const result = await db.select().from(users).limit(1);
    console.log("✓ Database connection successful!");
    console.log(`✓ Found ${result.length} user(s) in database`);
    
    // Try to check if tables exist
    console.log("\nTesting table structure...");
    if (result.length > 0) {
      console.log("Sample user:", {
        id: result[0].id,
        email: result[0].email,
        role: result[0].role,
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("✗ Database connection failed!");
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

testConnection();

