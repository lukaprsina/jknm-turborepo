import { db } from "@acme/db/client";

import { Shell } from "~/components/shell";
import { PreveriClient } from "./preveri-client";

export default async function PreveriPage() {
  const articles = await db.query.Article.findMany({
    columns: {
      id: true,
      old_id: true,
    },
  });

  return (
    <Shell>
      <PreveriClient articles={articles} />
    </Shell>
  );
}
