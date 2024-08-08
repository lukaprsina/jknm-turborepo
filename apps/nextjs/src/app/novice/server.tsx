"use server";

import { sql } from "@acme/db";
import { db } from "@acme/db/client";





export async function peepee() {
  const result = await db.execute(
    sql`select to_tsvector('english', 'Guide to PostgreSQL full-text search with Drizzle ORM')
    @@ to_tsquery('english', 'Drizzle') as match`,
  );
  console.log({ result });

}