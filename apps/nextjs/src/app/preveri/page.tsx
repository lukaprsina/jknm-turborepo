import { db } from "@acme/db/client";

import { Shell } from "~/components/shell";
// import { read_articles } from "../converter/converter-server";
import { PreveriClient } from "./preveri-client";

export default async function PreveriPage() {
  const articles = await db.query.Article.findMany({
    columns: {
      id: true,
      old_id: true,
    },
  });

  // const csv_articles = await read_articles();

  return (
    <Shell>
      <PreveriClient articles={articles} /* csv_articles={csv_articles} */ />
    </Shell>
  );
}
