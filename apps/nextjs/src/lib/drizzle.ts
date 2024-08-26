"use server";

import type { SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { getTableColumns, sql } from "drizzle-orm";

export const buildConflictUpdateColumns = <
  T extends PgTable | SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      if (!colName) {
        throw new Error(
          `Column ${String(column)} not found in table ${table._.name}`,
        );
      }

      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};
